import dynamic from "next/dynamic";
import { AppProps } from "next/app";
import React from "react";
const ThemeProvider = dynamic(() => import("next-themes").then((mod) => mod.ThemeProvider), { ssr: false }) as any;
import "../css/tailwind.css";

// Third party styles - moved to specific components where possible
// Questionnaire and Swiper styles are now component-level imports

import { SessionProvider } from "../context/SessionContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme" defaultTheme="tongxing">
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
