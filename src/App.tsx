/**
 * DevCost Lens — Phase 1: Foundation & Iconic UI Shell
 * Stop AI Bill Shock for Solo Developers
 * Built for Next.js 14 / Clerk / Supabase / Vercel
 * Author: Abdur Rahman Khan
 */

import React, { lazy, Suspense, useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
const HeroSection = lazy(() => import("./components/HeroSection").then((module) => ({ default: module.HeroSection })));
const FeaturesSection = lazy(() => import("./components/FeaturesSection").then((module) => ({ default: module.FeaturesSection })));
const AuthorSection = lazy(() => import("./components/AuthorSection").then((module) => ({ default: module.AuthorSection })));
const ModelPricingGrid = lazy(() => import("./components/ModelPricingGrid").then((module) => ({ default: module.ModelPricingGrid })));
const LoginPage = lazy(() => import("./components/LoginPage").then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("./components/SignupPage").then((module) => ({ default: module.SignupPage })));
const ApisVaultPage = lazy(() => import("./components/ApisVaultPage").then((module) => ({ default: module.ApisVaultPage })));
const TokenCounterPage = lazy(() => import("./components/TokenCounterPage").then((module) => ({ default: module.TokenCounterPage })));
const DashboardPage = lazy(() => import("./components/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const DonationPage = lazy(() => import("./components/DonationPage").then((module) => ({ default: module.DonationPage })));
const AdminPanelPage = lazy(() => import("./components/AdminPanelPage").then((module) => ({ default: module.AdminPanelPage })));

import { ActiveView } from "./types";
import { useUser } from "@clerk/react";
import { isUserAdmin } from "./lib/admin";

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>("landing");
  const { user } = useUser();
  const isAdmin = isUserAdmin(user);

  // URL hash / pathname synchronization
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace("#", "");

      if (path === "/admin" || hash === "admin") {
        setCurrentView("admin");
      } else if (path === "/donate" || hash === "donate") {
        setCurrentView("donation");
      } else if (path === "/apis" || hash === "apis") {
        setCurrentView("apis");
      } else if (path === "/dashboard" || hash === "dashboard") {
        setCurrentView("dashboard");
      } else if (path === "/token-counter" || hash === "token-counter") {
        setCurrentView("token-counter");
      }
    };

    handleUrlRoute();
    window.addEventListener("popstate", handleUrlRoute);
    window.addEventListener("hashchange", handleUrlRoute);
    return () => {
      window.removeEventListener("popstate", handleUrlRoute);
      window.removeEventListener("hashchange", handleUrlRoute);
    };
  }, []);

  useEffect(() => {
    if (currentView === "admin" && !isAdmin) {
      setCurrentView("dashboard");
      if (window.location.hash === "#admin") window.history.replaceState({}, "", "/#dashboard");
    }
  }, [currentView, isAdmin]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content Area based on Active View */}
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[40vh] grid place-items-center text-sm font-mono text-zinc-500" role="status">Loading DevCost Lens…</div>}>
        {currentView === "landing" && (
          <>
            <HeroSection
                onPromptCheck={() => setCurrentView("token-counter")}
              onExplorePricing={() => setCurrentView("donation")}
            />
            <ModelPricingGrid />
            <FeaturesSection />
            <AuthorSection />
          </>
        )}

        {currentView === "dashboard" && (
          <DashboardPage
            onNavigateToApis={() => setCurrentView("apis")}
            onNavigateToTokenCounter={() => setCurrentView("token-counter")}
              />
        )}

        {currentView === "apis" && (
          <ApisVaultPage
            onNavigateToDashboard={() => setCurrentView("dashboard")}
            onNavigateToTokenCounter={() => setCurrentView("token-counter")}
            onNavigateToPricing={() => setCurrentView("donation")}
          />
        )}

        {currentView === "token-counter" && (
          <TokenCounterPage
            onNavigateToDashboard={() => setCurrentView("dashboard")}
          />
        )}

        {currentView === "donation" && (
          <DonationPage onContinue={() => setCurrentView("apis")} />
        )}

        {currentView === "admin" && isAdmin && (
          <AdminPanelPage
            onBackToDashboard={() => setCurrentView("dashboard")}
            onNavigateToPricing={() => setCurrentView("donation")}
          />
        )}

        {currentView === "login" && (
          <LoginPage
            onSwitchToSignup={() => setCurrentView("signup")}
            onBackToHome={() => setCurrentView("landing")}
          />
        )}

        {currentView === "signup" && (
          <SignupPage
            onSwitchToLogin={() => setCurrentView("login")}
            onBackToHome={() => setCurrentView("landing")}
          />
        )}
        </Suspense>
      </main>

      {/* Global Footer with Abdur Rahman Khan intro card & links */}
      <Footer
        onNavigate={(view) => setCurrentView(view)}
      />

    </div>
  );
}
