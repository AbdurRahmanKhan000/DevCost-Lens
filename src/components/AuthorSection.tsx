import React from "react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Github, ExternalLink, Code2, Sparkles, Terminal, Heart } from "lucide-react";

export const AuthorSection: React.FC = () => {
  return (
    <section id="author" className="py-20 bg-zinc-950/80 border-t border-zinc-900 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <Badge variant="cyan" className="mb-2">
            Creator Spotlight
          </Badge>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Built for Developers, by a Developer
          </h2>
        </div>

        {/* The "Built by" Card */}
        <div className="rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle Top Border Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            {/* Avatar & Visual Node */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-950 border-2 border-cyan-500/40 p-1 shadow-lg shadow-cyan-500/10 flex items-center justify-center relative overflow-hidden group">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-cyan-950 via-zinc-900 to-emerald-950 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-wider bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                    ARK
                  </span>
                  <span className="text-[9px] font-mono text-cyan-300 uppercase tracking-wider mt-1 font-bold text-center leading-tight">
                    ARK Technologies
                  </span>
                </div>
                {/* Active indicator */}
                <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
              </div>
            </div>

            {/* Content & Details */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Abdur Rahman Khan
                    </h3>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>ARK Technologies</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-cyan-400 font-mono mt-1 font-medium">
                    Founder & Lead Systems Architect, ARK Technologies
                  </p>
                </div>

                {/* Built by label */}
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300 font-mono">
                  <span>Engineered with</span>
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>for High-Scale Devs</span>
                </div>
              </div>

              <p className="mt-4 text-sm text-zinc-200 leading-relaxed">
                DevCost Lens was created from a simple belief: developers should be able to explore AI boldly without losing control of their budgets. I built this project to make model costs understandable, usage visible, and smarter choices easier—so independent builders can spend more time creating and less time worrying about surprise bills.
              </p>

              {/* Action Links */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                <a
                  href="https://github.com/AbdurRahmanKhan000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto gap-2 text-xs font-mono h-9 border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 hover:text-white"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>github.com/AbdurRahmanKhan000</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500 ml-0.5" />
                  </Button>
                </a>

                <a
                  href="https://github.com/AbdurRahmanKhan000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full sm:w-auto gap-2 text-xs font-mono h-9"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Founder Portfolio</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 text-zinc-950" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
