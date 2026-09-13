import React from "react";
import { BrandLogo } from "./BrandLogo";
import { Github, ExternalLink, ShieldCheck, Heart } from "lucide-react";
import { ActiveView } from "../types";
import { useUser } from "@clerk/react";
import { isUserAdmin } from "../lib/admin";

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const isAdmin = isUserAdmin(user);

  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 text-zinc-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-900">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-3">
            <BrandLogo size="md" />
            <p className="text-zinc-400 text-xs max-w-sm leading-relaxed mt-2">
              The smart electricity meter for AI developers. Real-time cost telemetry, token burn tracking, and automated cheaper alternatives across 15+ models.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-knowledge client-side encryption via Web Crypto API AES-GCM</span>
            </div>
          </div>

          {/* Col 2: Navigation & Resources */}
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2 font-mono text-xs">
              <li>
                <button
                  onClick={() => onNavigate("apis")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  🔐 APIs & Live Meter
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("token-counter")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  ✨ Prompt & Best AI
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("dashboard")}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  ⚡ Spend Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("donation")}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Support the Project</span>
                </button>
              </li>
              {isAdmin && (
                <li>
                  <button
                    onClick={() => onNavigate("admin")}
                    className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  >
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Admin Command Panel</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Built by Abdur Rahman Khan */}
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
              Built By
            </h4>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="font-semibold text-white">Abdur Rahman Khan</div>
              <p className="text-[11px] text-cyan-400 font-medium">
                Founder of ARK Technologies
              </p>
              <div className="pt-2 flex flex-col gap-1.5 font-mono text-[11px]">
                <a
                  href="https://github.com/AbdurRahmanKhan000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-zinc-300 hover:text-cyan-400"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
                <a
                  href="https://portfolio-arkmfk.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-zinc-300 hover:text-emerald-400"
                >
                  <span>portfolio-arkmfk.vercel.app</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px] font-mono">
          <div>
            © {new Date().getFullYear()} DevCost Lens. Designed & built by Abdur Rahman Khan, Founder of ARK Technologies.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-Time Active
            </span>
            <span className="text-zinc-400">ARK Technologies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
