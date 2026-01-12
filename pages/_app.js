import dynamic from "next/dynamic";
const ThemeProvider = dynamic(() => import("next-themes").then((mod) => mod.ThemeProvider), { ssr: false });
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



function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="tongxing">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
