import React from "react";
import { BrandLogo } from "./BrandLogo";
import { Badge } from "./ui/Badge";
import { SignUp, UserButton, useUser } from "../lib/auth";
import { ShieldCheck, CheckCircle2, ExternalLink, Info } from "lucide-react";
import { Button } from "./ui/Button";

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onSuccessSignup?: (email: string) => void;
  onBackToHome: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onSwitchToLogin,
  onBackToHome,
}) => {
  const { user, isSignedIn } = useUser();
  const [isInIframe, setIsInIframe] = React.useState(false);

  React.useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Background Ambient Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <button
        onClick={onBackToHome}
        className="mb-6 text-xs font-mono text-zinc-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        <span>← Return to DevCost Lens Home</span>
      </button>

      {/* If already signed in */}
      {isSignedIn ? (
        <div className="w-full max-w-md p-8 rounded-2xl border border-emerald-500/30 bg-zinc-950/90 text-center backdrop-blur-2xl shadow-2xl">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Account Active</h2>
          <p className="text-sm text-zinc-400 mb-6 font-mono">
            Signed in as <strong>{user?.primaryEmailAddress?.emailAddress || user?.fullName}</strong>.
          </p>
          <div className="flex justify-center mb-6">
            <UserButton afterSignOutUrl="/" />
          </div>
          <Button variant="default" size="default" onClick={onBackToHome} className="w-full">
            Go to DevCost Lens Overview
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <BrandLogo size="md" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Create Developer Account
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Save hundreds every month on AI token burn
            </p>
            <div className="mt-2.5">
              <Badge variant="emerald" className="text-[10px] py-0.5">
                Encrypted Session
              </Badge>
            </div>
          </div>

          {/* Iframe Preview Notice for OAuth Popups */}
          {isInIframe && (
            <div className="mb-4 w-full p-3 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-xs font-mono text-zinc-300 shadow-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-zinc-200 font-semibold">Running in Preview Frame</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                    Browser security blocks third-party OAuth popups (GitHub / Google) inside embedded iframes, showing a blank window.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] transition-colors shadow-sm cursor-pointer"
                    >
                      <span>Open in Full Tab for 1-Click OAuth</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[10px] text-zinc-400">or sign up with Email below</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Official Clerk-Style SignUp Component */}
          <div className="w-full flex justify-center">
            <SignUp
              routing="hash"
              onSwitchToLogin={onSwitchToLogin}
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero plaintext keys · Hardware Web Crypto AES-GCM</span>
          </div>
        </div>
      )}
    </div>
  );
};
