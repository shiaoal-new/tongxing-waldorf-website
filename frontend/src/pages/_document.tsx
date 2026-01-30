import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-TW" suppressHydrationWarning>
        <Head>
          {/* Preconnect to Font domains */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

          {/* Preload critical local font to prevent layout shift */}
          <link
            rel="preload"
            href="/fonts/ChenYuluoyan-2.0-Thin.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />

          {/* Google Fonts: Serif for headings, Sans for body content */}
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@200..900&family=Noto+Sans+TC:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body suppressHydrationWarning>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
