import dynamic from "next/dynamic";
import { AppProps } from "next/app";
import React, { useEffect } from "react";
// import localFont from 'next/font/local';

const ThemeProvider = dynamic(() => import("next-themes").then((mod) => mod.ThemeProvider), { ssr: false }) as any;
const LayoutDebugger = dynamic(() => import("../components/ui/LayoutDebugger"), { ssr: false });
import "../css/tailwind.css";

// Third party styles - moved to specific components where possible
// Questionnaire and Swiper styles are now component-level imports

import { SessionProvider } from "../context/SessionContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme" defaultTheme="tongxing">
        <main
          className="font-body"
          style={{ '--font-accent': 'var(--font-chen)' } as React.CSSProperties}
        >
          {process.env.NODE_ENV === 'development' && <LayoutDebugger />}
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
