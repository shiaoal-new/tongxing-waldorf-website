import dynamic from "next/dynamic";
import { AppProps } from "next/app";
import React from "react";
const ThemeProvider = dynamic(() => import("next-themes").then((mod) => mod.ThemeProvider), { ssr: false }) as any;
import "../css/tailwind.css";

// Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';

// Questionnaire styles
import '../css/questionnaire.css';

// Survey styles
import 'survey-core/survey-core.min.css';

// Third party styles
import 'react-vertical-timeline-component/style.min.css';

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
