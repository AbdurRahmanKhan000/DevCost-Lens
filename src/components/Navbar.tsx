import React, { useState, useEffect } from "react";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./ui/Button";
import { ActiveView } from "../types";
import {
  Menu,
  X,
  Database,
  ExternalLink,
  Zap,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Gem,
  LogOut,
  Phone,
  Mail,
  User as UserIcon,
} from "lucide-react";
import {
  UserButton,
  SignInButton,
  useUser,
  useAuth,
  useClerk,
} from "@clerk/react";
import { isUserAdmin } from "../lib/admin";

interface NavbarProps {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  onOpenSchemaModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenSchemaModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const { user, isLoaded: userLoaded, isSignedIn: userSignedIn } = useUser();
  const { isSignedIn: authSignedIn, isLoaded: authLoaded, userId, sessionId } = useAuth();
  const clerk = useClerk();

  // Cache the authenticated identity to prevent a sign-in status flash.
  const [cachedUser, setCachedUser] = useState<{
    id?: string;
    phoneNumber?: string;
    email?: string;
    fullName?: string;
  } | null>(null);

  // Sync authenticated state to cache
  useEffect(() => {
    if (user || userId) {
      const phone =
        user?.primaryPhoneNumber?.phoneNumber ||
        user?.phoneNumbers?.[0]?.phoneNumber ||
        cachedUser?.phoneNumber;
      const email =
        user?.primaryEmailAddress?.emailAddress ||
        user?.emailAddresses?.[0]?.emailAddress ||
        cachedUser?.email;
      const fullName = user?.fullName || user?.firstName || cachedUser?.fullName;

      const info = {
        id: user?.id || userId,
        phoneNumber: phone,
        email: email,
        fullName: fullName,
      };
      setCachedUser(info);
      try {
        localStorage.setItem("devcost_auth_user", JSON.stringify(info));
      } catch {}
    }
  }, [user, userId]);

  // Robust determination of logged-in status
  const isAuthed = Boolean(userLoaded && authLoaded && (userSignedIn || authSignedIn));

  const displayPhone =
    user?.primaryPhoneNumber?.phoneNumber ||
    user?.phoneNumbers?.[0]?.phoneNumber ||
    cachedUser?.phoneNumber;

  const displayEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    cachedUser?.email;

  const displayName =
    user?.fullName ||
    user?.firstName ||
    cachedUser?.fullName ||
    displayPhone ||
    displayEmail ||
    "Developer";

  const isAdmin = isUserAdmin(user || cachedUser);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("devcost_auth_user");
      localStorage.removeItem("devcost_admin_email");
      setCachedUser(null);
      if (clerk) {
        await clerk.signOut();
      }
    } catch (err) {
      console.warn("Clerk sign out error:", err);
    }
    setCurrentView("landing");
    window.location.hash = "";
  };

  const handleNavClick = (view: ActiveView, hash?: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (hash && view === "landing") {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => handleNavClick("landing")}
            className="cursor-pointer"
          >
            <BrandLogo size="md" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-mono">
            <button
              onClick={() => handleNavClick("apis")}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === "apis"
                  ? "text-cyan-400 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>APIs & Live Meter</span>
            </button>
            <button
              onClick={() => handleNavClick("token-counter")}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === "token-counter"
                  ? "text-cyan-400 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Prompt & Best AI</span>
            </button>
            <button
              onClick={() => handleNavClick("dashboard")}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === "dashboard"
                  ? "text-cyan-400 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spend Dashboard</span>
            </button>
            <button
              onClick={() => handleNavClick("donation")}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === "donation"
                  ? "text-amber-400 font-semibold"
                  : "text-zinc-400 hover:text-amber-300"
              }`}
            >
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              <span>Support the Project</span>
            </button>

            {/* Admin-only Controls */}
            {isAdmin && (
              <>
                <button
                  onClick={() => handleNavClick("admin")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    currentView === "admin"
                      ? "bg-cyan-500 text-zinc-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20"
                      : "bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60"
                  }`}
                  title="Admin Command Panel"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Admin Panel</span>
                </button>

                <button
                  onClick={() => onOpenSchemaModal?.()}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Founder-only developer handover controls"
                >
                  <Database className="w-3 h-3 text-cyan-400" />
                  <span>Supabase & Vercel</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Clerk Authentication Controls */}
            {!isAuthed ? (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
                  >
                    Sign In
                  </Button>
                </SignInButton>

              </>
            ) : (
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
                {/* Explicit Sign Out Button TO THE LEFT */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 px-2.5 text-xs font-mono text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-500/40 cursor-pointer transition-all flex items-center gap-1.5"
                  title="Sign Out of Session"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </Button>

                {/* User Phone / Email Status */}
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-mono font-medium text-white truncate max-w-[170px] flex items-center gap-1.5 justify-end">
                    {displayPhone ? (
                      <>
                        <Phone className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>{displayPhone}</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>{displayEmail || displayName}</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {displayPhone ? "Phone Active" : "Clerk Active"}
                  </span>
                </div>

                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-cyan-500/50 rounded-full",
                    },
                  }}
                />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-3 pb-5 space-y-3 font-mono text-sm">
          <button
            onClick={() => handleNavClick("apis")}
            className="block w-full text-left py-2 text-zinc-300 hover:text-cyan-400 font-semibold"
          >
            🔐 APIs & Live Meter
          </button>
          <button
            onClick={() => handleNavClick("token-counter")}
            className="block w-full text-left py-2 text-zinc-300 hover:text-cyan-400 font-semibold"
          >
            ✨ Prompt & Best AI Suggester
          </button>
          <button
            onClick={() => handleNavClick("dashboard")}
            className="block w-full text-left py-2 text-zinc-300 hover:text-cyan-400 font-semibold"
          >
            ⚡ Spend Dashboard
          </button>
          <button
            onClick={() => handleNavClick("donation")}
            className="block w-full text-left py-2 text-amber-400 hover:text-amber-300 font-semibold"
          >
            💎 Support the Project
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSchemaModal();
              }}
              className="flex items-center justify-between w-full text-left py-2 text-cyan-400"
            >
              <span>Supabase & Vercel Guide</span>
              <span className="text-[10px] uppercase bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">Admin</span>
            </button>
          )}

          <div className="pt-3 border-t border-zinc-800">
            {!isAuthed ? (
              <div className="flex flex-col gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-mono">
                    Sign In with Clerk
                  </Button>
                </SignInButton>
              </div>
            ) : (
              <div className="flex items-center justify-between py-2 gap-2">
                <div className="flex items-center gap-2 truncate">
                  {displayPhone ? (
                    <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                  <span className="text-zinc-200 text-xs truncate max-w-[180px]">
                    {displayPhone || displayEmail || displayName}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="h-8 px-2.5 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-zinc-800 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </Button>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
