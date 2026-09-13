/**
 * DevCost Lens — Phase 1: Foundation & Iconic UI Shell
 * Stop AI Bill Shock for Solo Developers
 * Built for Next.js 14 / Clerk / Supabase / Vercel
 * Author: Abdur Rahman Khan
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { ModelPricingGrid } from "./components/ModelPricingGrid";
import { AuthorSection } from "./components/AuthorSection";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { ApisVaultPage } from "./components/ApisVaultPage";
import { TokenCounterPage } from "./components/TokenCounterPage";
import { DashboardPage } from "./components/DashboardPage";
import { DonationPage } from "./components/DonationPage";
import { AdminPanelPage } from "./components/AdminPanelPage";

import { ActiveView, ThemeMode } from "./types";
import { useUser } from "@clerk/react";

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>("landing");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const { user } = useUser();

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

  // Sync dark class on html tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area based on Active View */}
      <main className="flex-1">
        {currentView === "landing" && (
          <>
            <HeroSection
              onGetStarted={() => setCurrentView("apis")}
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

        {currentView === "admin" && (
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
      </main>

      {/* Global Footer with Abdur Rahman Khan intro card & links */}
      <Footer
        onNavigate={(view) => setCurrentView(view)}
      />

    </div>
  );
}
