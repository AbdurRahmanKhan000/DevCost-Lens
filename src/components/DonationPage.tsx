import React from "react";
import { Heart, CreditCard, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "./ui/Button";

interface DonationPageProps {
  onContinue: () => void;
}

export const DonationPage: React.FC<DonationPageProps> = ({ onContinue }) => (
  <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
    <div className="rounded-3xl border border-cyan-500/30 bg-zinc-900/80 p-8 sm:p-12 shadow-2xl shadow-cyan-950/20">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
        <Heart className="h-7 w-7" />
      </div>
      <p className="mt-6 text-xs font-mono uppercase tracking-[0.2em] text-cyan-400">Keep DevCost Lens free</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">Support the project if it helps you.</h1>
      <p className="mt-5 text-base leading-7 text-zinc-300">DevCost Lens is now free for everyone, with unlimited API connections. If you find it useful, an optional card donation helps cover hosting, maintenance, and future improvements.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5"><CreditCard className="h-5 w-5 text-cyan-400" /><h2 className="mt-3 font-mono font-bold text-white">Card donations</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Visa, Mastercard, SadaPay, NayaPay, and other supported cards can be used. Donation details are securely managed by the founder.</p></div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5"><ShieldCheck className="h-5 w-5 text-emerald-400" /><h2 className="mt-3 font-mono font-bold text-white">Always optional</h2><p className="mt-2 text-sm leading-6 text-zinc-400">You never need to donate to connect APIs or use any DevCost Lens feature.</p></div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><Button onClick={onContinue} className="font-mono">Continue using DevCost Lens</Button><Button onClick={onContinue} variant="outline" className="font-mono"><ArrowLeft className="mr-2 h-4 w-4" />Skip for now</Button></div>
    </div>
  </section>
);
