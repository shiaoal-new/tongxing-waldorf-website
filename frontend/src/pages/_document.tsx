import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-TW" suppressHydrationWarning>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@400;500;700&family=Zeyada&display=swap"
            rel="stylesheet"
          />

          {/* Preload hero section poster images for faster LCP */}
          <link
            rel="preload"
            as="image"
            href="/img/video-poster.webp"
            media="(min-width: 769px)"
            // @ts-ignore - fetchpriority is a valid attribute
            fetchpriority="high"
          />
          <link
            rel="preload"
            as="image"
            href="/img/video-poster-mobile.webp"
            media="(max-width: 768px)"
            // @ts-ignore - fetchpriority is a valid attribute
            fetchpriority="high"
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
