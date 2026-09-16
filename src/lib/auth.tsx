import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  ClerkProvider as BaseClerkProvider,
  SignIn as BaseClerkSignIn,
  SignUp as BaseClerkSignUp,
  UserButton as BaseClerkUserButton,
  SignInButton as BaseClerkSignInButton,
  SignUpButton as BaseClerkSignUpButton,
  useUser as useBaseClerkUser,
  useAuth as useBaseClerkAuth,
  useClerk as useBaseClerk,
} from "@clerk/react";
import { dark } from "@clerk/themes";
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from "lucide-react";
import { isUserAdmin } from "./admin";

export { dark };

export interface AuthUser {
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
  primaryPhoneNumber?: { phoneNumber: string } | null;
  phoneNumbers?: { phoneNumber: string }[];
  imageUrl?: string;
}

export interface AuthContextType {
  user: any | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  publishableKey: string | null;
  isClerkConfigured: boolean;
  setPublishableKey: (key: string) => void;
  signOut: () => Promise<void>;
  openSignIn: () => void;
  openSignUp: () => void;
}

const STORAGE_KEY_PUBKEY = "devcost_clerk_publishable_key";

// Helper to validate whether a key looks like a real Clerk publishable key
export function isValidClerkPublishableKey(key?: string | null): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (trimmed === "pk_test_..." || trimmed === "pk_live_...") return false;
  return (
    (trimmed.startsWith("pk_test_") || trimmed.startsWith("pk_live_")) &&
    trimmed.length > 20
  );
}

// Global state for publishable key listener
let keyChangeListeners: Array<(key: string | null) => void> = [];

export function notifyKeyChange(key: string | null) {
  keyChangeListeners.forEach((listener) => listener(key));
}

// Initial resolution of Clerk Publishable Key
function getInitialPublishableKey(): string | null {
  const envKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (isValidClerkPublishableKey(envKey)) {
    return envKey.trim();
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PUBKEY);
      if (isValidClerkPublishableKey(stored)) {
        return stored!.trim();
      }
      const altStored = localStorage.getItem("clerk_publishable_key");
      if (isValidClerkPublishableKey(altStored)) {
        return altStored!.trim();
      }
    } catch {
      // ignore
    }
  }

  return null;
}

const FallbackAuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  sessionId: null,
  publishableKey: null,
  isClerkConfigured: false,
  setPublishableKey: () => {},
  signOut: async () => {},
  openSignIn: () => {},
  openSignUp: () => {},
});

/**
 * Inner component mounted inside BaseClerkProvider when a valid Clerk key is active.
 * Exposes real Clerk authentication data to the app.
 */
const ClerkActiveBridge: React.FC<{
  publishableKey: string;
  onSetKey: (k: string) => void;
  children: React.ReactNode;
}> = ({ publishableKey, onSetKey, children }) => {
  const clerkUser = useBaseClerkUser();
  const clerkAuth = useBaseClerkAuth();
  const clerk = useBaseClerk();

  // Clear any legacy mock sessions from prior turns
  useEffect(() => {
    try {
      localStorage.removeItem("devcost_lens_active_user");
    } catch {}
  }, []);

  const openSignIn = () => {
    try {
      if (clerk && typeof clerk.openSignIn === "function") {
        clerk.openSignIn();
        return;
      }
    } catch {}
    if (typeof window !== "undefined") {
      window.location.hash = "login";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };

  const openSignUp = () => {
    try {
      if (clerk && typeof clerk.openSignUp === "function") {
        clerk.openSignUp();
        return;
      }
    } catch {}
    if (typeof window !== "undefined") {
      window.location.hash = "signup";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };

  const contextValue: AuthContextType = useMemo(() => {
    return {
      user: clerkUser.user || null,
      isLoaded: clerkUser.isLoaded && clerkAuth.isLoaded,
      isSignedIn: Boolean(clerkUser.isSignedIn || clerkAuth.isSignedIn),
      userId: clerkAuth.userId || clerkUser.user?.id || null,
      sessionId: clerkAuth.sessionId || null,
      publishableKey,
      isClerkConfigured: true,
      setPublishableKey: onSetKey,
      signOut: async () => {
        try {
          localStorage.removeItem("devcost_auth_user");
          localStorage.removeItem("devcost_admin_email");
          await clerk.signOut();
        } catch (e) {
          console.warn("Clerk signOut error:", e);
        }
      },
      openSignIn,
      openSignUp,
    };
  }, [clerkUser.user, clerkUser.isLoaded, clerkUser.isSignedIn, clerkAuth.isLoaded, clerkAuth.isSignedIn, clerkAuth.userId, clerkAuth.sessionId, publishableKey, onSetKey, clerk]);

  return (
    <FallbackAuthContext.Provider value={contextValue}>
      {children}
    </FallbackAuthContext.Provider>
  );
};

/**
 * Main AuthProvider:
 * - Checks for valid Clerk Publishable Key (env, localStorage, or server config).
 * - When valid: Wraps the app in real @clerk/react BaseClerkProvider.
 * - When missing: Renders FallbackAuthContext that prompts for Clerk configuration without any mock bypasses.
 */
export const AuthProvider: React.FC<{
  children: React.ReactNode;
  publishableKey?: string;
  [key: string]: any;
}> = ({ children, publishableKey: propKey }) => {
  const [activeKey, setActiveKey] = useState<string | null>(() => {
    if (isValidClerkPublishableKey(propKey)) return propKey!.trim();
    return getInitialPublishableKey();
  });

  // Attempt to fetch key from server endpoint /api/auth/clerk-config
  useEffect(() => {
    if (!activeKey) {
      fetch("/api/auth/clerk-config")
        .then((res) => res.json())
        .then((data) => {
          if (data?.publishableKey && isValidClerkPublishableKey(data.publishableKey)) {
            setActiveKey(data.publishableKey.trim());
            try {
              localStorage.setItem(STORAGE_KEY_PUBKEY, data.publishableKey.trim());
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [activeKey]);

  useEffect(() => {
    const handleKeyChange = (k: string | null) => {
      setActiveKey(k);
    };
    keyChangeListeners.push(handleKeyChange);
    return () => {
      keyChangeListeners = keyChangeListeners.filter((l) => l !== handleKeyChange);
    };
  }, []);

  const handleSetKey = (newKey: string) => {
    const clean = newKey.trim();
    if (isValidClerkPublishableKey(clean)) {
      try {
        localStorage.setItem(STORAGE_KEY_PUBKEY, clean);
      } catch {}
      setActiveKey(clean);
      notifyKeyChange(clean);
    } else {
      throw new Error("Invalid Clerk Publishable Key format. Must start with pk_test_ or pk_live_");
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("devcost_auth_user");
      localStorage.removeItem("devcost_admin_email");
      localStorage.removeItem("devcost_lens_active_user");
    } catch {}
    if (typeof window !== "undefined") {
      window.location.hash = "";
    }
  };

  const openSignIn = () => {
    if (typeof window !== "undefined") {
      window.location.hash = "login";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };

  const openSignUp = () => {
    if (typeof window !== "undefined") {
      window.location.hash = "signup";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };

  // If a valid publishable key exists, mount the real @clerk/react BaseClerkProvider!
  if (activeKey && isValidClerkPublishableKey(activeKey)) {
    return (
      <BaseClerkProvider
        publishableKey={activeKey}
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: "font-mono",
            card: "border border-zinc-800 shadow-2xl bg-zinc-950/95 font-mono rounded-2xl",
            headerTitle: "text-white font-mono font-bold text-lg",
            headerSubtitle: "text-zinc-400 font-mono text-xs",
            socialButtonsBlockButton: "border border-zinc-700/80 bg-zinc-900/80 hover:bg-zinc-800 text-white font-mono text-xs",
            formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold font-mono text-xs transition-all shadow-md shadow-cyan-500/20",
            formFieldInput: "bg-zinc-900 border-zinc-700 text-white font-mono text-xs focus:border-cyan-500",
            footerActionLink: "text-cyan-400 hover:text-cyan-300 font-mono underline",
          },
        } as any}
      >
        <ClerkActiveBridge publishableKey={activeKey} onSetKey={handleSetKey}>
          {children}
        </ClerkActiveBridge>
      </BaseClerkProvider>
    );
  }

  // Fallback state: Clerk Key is not yet provided.
  // There are NO mock logins, NO founder or developer bypasses.
  const fallbackValue: AuthContextType = {
    user: null,
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    sessionId: null,
    publishableKey: null,
    isClerkConfigured: false,
    setPublishableKey: handleSetKey,
    signOut: handleSignOut,
    openSignIn,
    openSignUp,
  };

  return (
    <FallbackAuthContext.Provider value={fallbackValue}>
      {children}
    </FallbackAuthContext.Provider>
  );
};

export const ClerkProvider = AuthProvider;

/**
 * Hook to access the authenticated user.
 * Behind the scenes, the user's email is verified:
 * - If email === "arkmfk27@gmail.com", isUserAdmin(user) is true.
 * - Otherwise, standard developer role is granted.
 */
export function useUser() {
  const ctx = useContext(FallbackAuthContext);
  return {
    user: ctx.user,
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
  };
}

/**
 * Hook for authentication state and token acquisition.
 */
export function useAuth() {
  const ctx = useContext(FallbackAuthContext);
  return {
    isSignedIn: ctx.isSignedIn,
    isLoaded: ctx.isLoaded,
    userId: ctx.userId,
    sessionId: ctx.sessionId,
    signOut: ctx.signOut,
    getToken: async () => null,
  };
}

/**
 * Hook to interact with Clerk methods.
 */
export function useClerk() {
  const ctx = useContext(FallbackAuthContext);
  return {
    signOut: ctx.signOut,
    openSignIn: ctx.openSignIn,
    openSignUp: ctx.openSignUp,
  };
}

/**
 * Clerk Setup / Activation Card
 * Displayed when Clerk Publishable Key has not yet been connected.
 * Informs the user and provides a direct input to connect their Clerk instance
 * (ins_3JDLSWgmf0xLeXL0svGrFntXPPr) from their Clerk Dashboard.
 */
export const ClerkActivationCard: React.FC<{
  mode?: "sign-in" | "sign-up";
  onSwitchMode?: () => void;
}> = ({ mode = "sign-in", onSwitchMode }) => {
  const { setPublishableKey } = useContext(FallbackAuthContext);
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = inputKey.trim();

    if (!isValidClerkPublishableKey(clean)) {
      setError("Please enter a valid Clerk Publishable Key (starting with pk_test_ or pk_live_).");
      return;
    }

    try {
      setLoading(true);
      setPublishableKey(clean);
    } catch (err: any) {
      setError(err?.message || "Failed to set Clerk Publishable Key");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-zinc-800 bg-[#13151b]/95 shadow-2xl backdrop-blur-2xl p-6 sm:p-7 text-zinc-100 font-mono">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/10">
          <KeyRound className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          Connect Clerk Authentication
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          {mode === "sign-in" ? "Sign In via Official Clerk Auth" : "Sign Up via Official Clerk Auth"}
        </p>
      </div>

      {/* Instance Info Badge */}
      <div className="mb-4 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400">Clerk Instance:</span>
          <span className="text-cyan-300 font-bold font-mono">ins_3JDLSWgmf0xLeXL0svGrFntXPPr</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400">Application:</span>
          <span className="text-zinc-200">My Application (Development)</span>
        </div>
      </div>

      <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
        Paste your <strong>Publishable Key</strong> from your Clerk Dashboard (under <strong>API Keys</strong>) to activate live authentication for all users:
      </p>

      {error && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Key Input Form */}
      <form onSubmit={handleConnect} className="space-y-3">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
            Clerk Publishable Key
          </label>
          <input
            type="text"
            required
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="pk_test_..."
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
        >
          {loading ? (
            <span>Connecting Clerk...</span>
          ) : (
            <>
              <span>Connect Live Clerk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Security & Verification Guarantee */}
      <div className="mt-5 pt-4 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-2">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong>Strict Identity Verification:</strong> Users must verify through Clerk credentials or email OTP. No unauthorized email can log in.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong>Founder Access:</strong> Founder privileges for <code className="text-cyan-300">arkmfk27@gmail.com</code> are checked strictly behind the scenes upon verified sign-in.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * SignIn Component:
 * - When Clerk Publishable Key is active: renders the real @clerk/react <BaseClerkSignIn />.
 * - When missing: renders ClerkActivationCard to connect the key.
 * Strictly no mock bypasses, no hardcoded "Founder" or "Developer" accounts.
 */
export const SignIn: React.FC<{
  routing?: "hash" | "path";
  appearance?: any;
  signUpUrl?: string;
  onSwitchToSignup?: () => void;
}> = ({ routing = "hash", appearance, signUpUrl = "#signup", onSwitchToSignup }) => {
  const { isClerkConfigured } = useContext(FallbackAuthContext);

  if (isClerkConfigured) {
    return (
      <BaseClerkSignIn
        routing={routing as any}
        signUpUrl={signUpUrl}
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: "w-full flex justify-center font-mono",
            card: "border border-zinc-800 shadow-2xl bg-zinc-950/95 font-mono rounded-2xl",
            headerTitle: "text-white font-mono font-bold text-lg",
            headerSubtitle: "text-zinc-400 font-mono text-xs",
            socialButtonsBlockButton: "border border-zinc-700/80 bg-zinc-900/80 hover:bg-zinc-800 text-white font-mono text-xs",
            formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold font-mono text-xs transition-all shadow-md shadow-cyan-500/20",
            formFieldInput: "bg-zinc-900 border-zinc-700 text-white font-mono text-xs focus:border-cyan-500",
            footerActionLink: "text-cyan-400 hover:text-cyan-300 font-mono underline",
          },
          ...appearance,
        }}
      />
    );
  }

  return <ClerkActivationCard mode="sign-in" onSwitchMode={onSwitchToSignup} />;
};

/**
 * SignUp Component:
 * - When Clerk Publishable Key is active: renders the real @clerk/react <BaseClerkSignUp />.
 * - When missing: renders ClerkActivationCard to connect the key.
 */
export const SignUp: React.FC<{
  routing?: "hash" | "path";
  appearance?: any;
  signInUrl?: string;
  onSwitchToLogin?: () => void;
}> = ({ routing = "hash", appearance, signInUrl = "#login", onSwitchToLogin }) => {
  const { isClerkConfigured } = useContext(FallbackAuthContext);

  if (isClerkConfigured) {
    return (
      <BaseClerkSignUp
        routing={routing as any}
        signInUrl={signInUrl}
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: "w-full flex justify-center font-mono",
            card: "border border-zinc-800 shadow-2xl bg-zinc-950/95 font-mono rounded-2xl",
            headerTitle: "text-white font-mono font-bold text-lg",
            headerSubtitle: "text-zinc-400 font-mono text-xs",
            socialButtonsBlockButton: "border border-zinc-700/80 bg-zinc-900/80 hover:bg-zinc-800 text-white font-mono text-xs",
            formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-xs transition-all shadow-md shadow-emerald-500/20",
            formFieldInput: "bg-zinc-900 border-zinc-700 text-white font-mono text-xs focus:border-emerald-500",
            footerActionLink: "text-emerald-400 hover:text-emerald-300 font-mono underline",
          },
          ...appearance,
        }}
      />
    );
  }

  return <ClerkActivationCard mode="sign-up" onSwitchMode={onSwitchToLogin} />;
};

/**
 * UserButton Component:
 * Wraps @clerk/react's UserButton or provides account status.
 */
export const UserButton: React.FC<{
  afterSignOutUrl?: string;
  appearance?: any;
}> = ({ appearance }) => {
  const { isClerkConfigured, user, signOut } = useContext(FallbackAuthContext);

  if (isClerkConfigured && user) {
    return (
      <BaseClerkUserButton
        appearance={{
          baseTheme: dark,
          elements: {
            userButtonAvatarBox: "w-8 h-8 rounded-full border border-cyan-500/50",
            userButtonPopoverCard: "border border-zinc-800 bg-zinc-950 shadow-2xl font-mono",
          },
          ...appearance,
        }}
      />
    );
  }

  if (user) {
    const email = user.primaryEmailAddress?.emailAddress || user.email || "Developer";
    return (
      <button
        onClick={signOut}
        className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700"
        title="Sign Out"
      >
        {email} (Sign Out)
      </button>
    );
  }

  return null;
};

export const SignInButton: React.FC<{
  children?: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
  className?: string;
}> = ({ children, mode = "modal", className }) => {
  const { isClerkConfigured, openSignIn } = useContext(FallbackAuthContext);

  if (isClerkConfigured) {
    return (
      <BaseClerkSignInButton mode={mode}>
        {children || (
          <button className={className || "px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400 transition-colors"}>
            Sign In
          </button>
        )}
      </BaseClerkSignInButton>
    );
  }

  if (children && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as any).props?.onClick?.(e);
        openSignIn();
      },
    });
  }

  return (
    <button onClick={openSignIn} className={className}>
      {children || "Sign In"}
    </button>
  );
};

export const SignUpButton: React.FC<{
  children?: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
  className?: string;
}> = ({ children, mode = "modal", className }) => {
  const { isClerkConfigured, openSignUp } = useContext(FallbackAuthContext);

  if (isClerkConfigured) {
    return (
      <BaseClerkSignUpButton mode={mode}>
        {children || (
          <button className={className || "px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-colors"}>
            Sign Up
          </button>
        )}
      </BaseClerkSignUpButton>
    );
  }

  if (children && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as any).props?.onClick?.(e);
        openSignUp();
      },
    });
  }

  return (
    <button onClick={openSignUp} className={className}>
      {children || "Sign Up"}
    </button>
  );
};

export const SignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
};

export const SignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
};

