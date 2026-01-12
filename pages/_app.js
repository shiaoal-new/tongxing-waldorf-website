import { ThemeProvider } from "next-themes";
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
    <ThemeProvider attribute="data-theme" defaultTheme="tongxing" enableSystem={false}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
