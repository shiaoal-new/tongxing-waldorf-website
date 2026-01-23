import dynamic from "next/dynamic";
import { AppProps } from "next/app";
import React from "react";
import localFont from 'next/font/local';

const ThemeProvider = dynamic(() => import("next-themes").then((mod) => mod.ThemeProvider), { ssr: false }) as any;
import "../css/tailwind.css";

// Third party styles - moved to specific components where possible
// Questionnaire and Swiper styles are now component-level imports

import { SessionProvider } from "../context/SessionContext";

const chenYuluoyan = localFont({
  src: '../../public/fonts/ChenYuluoyan-2.0-Thin.woff2',
  variable: '--font-chen',
  display: 'swap',
  declarations: [
    { prop: 'size-adjust', value: '150%' }
  ],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme" defaultTheme="tongxing">
        <main className={chenYuluoyan.variable}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
