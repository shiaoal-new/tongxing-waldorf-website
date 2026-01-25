import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-TW" suppressHydrationWarning>
        <Head>

          {/* Hero poster preload moved to page-level components for dynamic configuration */}
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
