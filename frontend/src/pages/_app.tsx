import dynamic from "next/dynamic";
import { AppProps } from "next/app";
import React, { useEffect } from "react";


const ThemeProvider = dynamic(() => import("next-themes").then((mod) => mod.ThemeProvider), { ssr: false }) as any;
const LayoutDebugger = dynamic(() => import("../components/ui/LayoutDebugger"), { ssr: false });
const WordingDebugger = dynamic(() => import("../components/ui/WordingDebugger"), { ssr: false });
const YmlLocator = dynamic(() => import("../components/ui/YmlLocator"), { ssr: false });
import "../css/tailwind.css";

// Third party styles - moved to specific components where possible
// Questionnaire and Swiper styles are now component-level imports

import { SessionProvider } from "../context/SessionContext";
import { WordingProvider } from "../context/WordingContext";
import { ImageKitProvider } from "@imagekit/next";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT}>
      <WordingProvider>
        <SessionProvider>
          <ThemeProvider attribute="data-theme" defaultTheme="tongxing">
            <main
              className="font-body"
              style={{ '--font-accent': 'var(--font-chen)' } as React.CSSProperties}
            >
              {process.env.NODE_ENV === 'development' && <LayoutDebugger />}
              {process.env.NODE_ENV === 'development' && <WordingDebugger />}
              {process.env.NODE_ENV === 'development' && <YmlLocator />}
              <Component {...pageProps} />
            </main>
          </ThemeProvider>
        </SessionProvider>
      </WordingProvider>
    </ImageKitProvider>
  );
}

export default MyApp;
