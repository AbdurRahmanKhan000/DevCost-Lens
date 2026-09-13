import React, { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Heart, ShieldCheck } from "lucide-react";
import { Button } from "./ui/Button";

interface DonationPageProps {
  onContinue: () => void;
}

interface DonationCardDetails {
  isConfigured: boolean;
  cardNumber: string | null;
  cardholder: string | null;
  bankName: string;
  instructions: string;
}

export const DonationPage: React.FC<DonationPageProps> = ({ onContinue }) => {
  const [details, setDetails] = useState<DonationCardDetails | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/donation/card")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: DonationCardDetails | null) => {
        if (active) setDetails(data);
      })
      .catch(() => {
        if (active) setDetails(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-cyan-500/30 bg-zinc-900/80 p-8 shadow-2xl shadow-cyan-950/20 sm:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
          <Heart className="h-7 w-7" />
        </div>
        <p className="mt-6 text-xs font-mono uppercase tracking-[0.2em] text-cyan-400">Keep DevCost Lens free</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">Support the project if it helps you.</h1>
        <p className="mt-5 text-base leading-7 text-zinc-300">DevCost Lens is free for everyone, with unlimited API connections. If it saves you time or helps control AI costs, an optional card donation helps cover hosting and continued improvements.</p>

        <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-zinc-950/80 p-5">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="font-mono font-bold text-white">Donate by card</h2>
              <p className="text-sm text-zinc-400">Visa, Mastercard, SadaPay, NayaPay, and other supported cards.</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            {details?.isConfigured ? (
              <>
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Receiving card</p>
                <p className="mt-2 break-all text-xl font-mono font-bold tracking-wide text-cyan-300">{details.cardNumber}</p>
                {details.cardholder && <p className="mt-2 text-sm text-zinc-300">Cardholder: {details.cardholder}</p>}
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-400">{details.instructions}</p>
              </>
            ) : (
              <p className="text-sm leading-6 text-zinc-400">The founder is adding the receiving card number. Once configured in the private Admin Panel, it will appear here for optional donations.</p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
          <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-400" /><h2 className="font-mono font-bold text-white">Always optional</h2></div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">You never need to donate to connect APIs or use any DevCost Lens feature.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3"><Button onClick={onContinue} className="font-mono">Continue using DevCost Lens</Button><Button onClick={onContinue} variant="outline" className="font-mono"><ArrowLeft className="mr-2 h-4 w-4" />Skip for now</Button></div>
      </div>
    </section>
  );
};
