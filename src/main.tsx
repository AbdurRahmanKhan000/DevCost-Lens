import { ClerkProvider } from '@clerk/react';
import { dark } from '@clerk/themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const publishableKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

if (!publishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to the Vercel Production environment and redeploy.");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/"
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: '#06b6d4',
          colorPrimaryForeground: '#09090b',
          colorBackground: '#09090b',
          colorForeground: '#fafafa',
          colorMutedForeground: '#a1a1aa',
        },
        elements: {
          card: 'bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-xl',
          headerTitle: 'text-white font-bold',
          headerSubtitle: 'text-zinc-400 font-mono text-xs',
          formFieldInput: 'bg-zinc-800/90 border-zinc-700 text-white focus:border-cyan-500',
          socialButtonsIconButton: 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white transition-all',
          socialButtonsBlockButton: 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white',
          formButtonPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold',
          footerActionLink: 'text-cyan-400 hover:text-cyan-300',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
