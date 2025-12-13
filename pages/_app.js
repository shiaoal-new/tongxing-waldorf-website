import { ThemeProvider } from "next-themes";
import "../css/tailwind.css";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
