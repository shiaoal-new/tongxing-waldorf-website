import Link from "next/link";
import React from "react";
import Container from "./container";
import Logo from "./logo";
import DevComment from "./DevComment";

// Helper component for footer content to avoid duplication in code

function FooterContent() {
  const navigation = [
    { title: "關於我們", path: "/" },
    { title: "課程介紹", path: "/featured-courses" },
    { title: "招生資訊", path: "/visit" },
    { title: "師資團隊", path: "/teacher-group" },
    { title: "校園生活", path: "/daily-routine" }
  ];
  const legal = [
    { title: "隱私權政策", path: "/" },
    { title: "使用條款", path: "/" }
  ];

  return (
    <>
      <Container>
        <div className="grid w-full grid-cols-1 spacing-component pt-section mx-auto mt-component border-t border-brand-taupe/10 dark:border-brand-structural lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div>
              {" "}
              <Link
                href="/"
                className="flex items-center space-x-2 text-2xl font-medium text-brand-accent dark:text-brand-bg">
                <Logo />
                <span>同心華德福實驗教育機構</span>
              </Link>
            </div>

            <div className="max-w-md mt-4 text-brand-taupe dark:text-brand-taupe text-sm leading-brand">
              同心華德福為一所致力於實踐華德福教育理念的實驗教育機構，期盼親師生共同成長，創造良善的教育社群。
            </div>
          </div>

          <div>
            <ul className="menu bg-transparent p-0">
              {navigation.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.path}
                    className="text-brand-taupe dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent text-sm">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ul className="menu bg-transparent p-0">
              {legal.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.path}
                    className="text-brand-taupe dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent text-sm">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="">
            <div className="font-bold text-brand-text dark:text-brand-bg uppercase tracking-widest text-xs mb-4">追蹤我們 (Follow us)</div>
            <div className="flex mt-5 space-x-5 text-brand-taupe dark:text-brand-taupe">
              <a
                href="https://facebook.com/taipeiwaldorf/"
                target="_blank"
                rel="noopener">
                <span className="sr-only">Facebook</span>
                <Facebook />
              </a>
              <a
                href="https://instagram.com/taipeiwaldorf/"
                target="_blank"
                rel="noopener">
                <span className="sr-only">Instagram</span>
                <Instagram />
              </a>
              <a
                href="https://www.youtube.com/@taipeiwaldorf"
                target="_blank"
                rel="noopener">
                <span className="sr-only">YouTube</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

      </Container>
      <DevComment text="Footer Backlink (Hidden in production)" />
      {/* <Backlink /> */}

    </>
  );
}

import { useRef } from "react";
import { useTheme } from "next-themes";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Footer() {
  const spacerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ["start end", "end end"]
  });

  // Parallax effect: Footer starts 50% down (visually lower) and moves up to 0% (normal position)
  // as the user scrolls through the footer height.
  // This creates a "slower move up" effect compared to the main content.
  const y = useTransform(scrollYProgress, [0, 1], ["50%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  const { theme } = useTheme();

  return (
    <footer className="relative">
      <DevComment text="Invisible spacer footer (Physical space provider)" />
      {/* Invisible spacer footer that takes up space in the document flow */}

      <div ref={spacerRef} className="invisible relative z-[-1]" aria-hidden="true">
        <FooterContent />
      </div>

      <DevComment text="Visible fixed footer with parallax animation" />
      {/* Visible fixed footer that sits behind the content and animates */}

      <motion.footer
        className="fixed bottom-0 w-full z-0 block bg-cover bg-center bg-no-repeat bg-brand-taupe/10 dark:bg-brand-structural border-t border-brand-taupe/10 dark:border-trueGray-700 shadow-t-lg"
        style={{
          y,
          opacity,
          scale,
          backgroundImage: theme === 'tongxing' ? "url('/img/themes/tongxing/background/footer.webp')" : "none"
        }}
      >
        <FooterContent />
      </motion.footer>
    </footer>
  );
}

const Twitter = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M24 4.37a9.6 9.6 0 0 1-2.83.8 5.04 5.04 0 0 0 2.17-2.8c-.95.58-2 1-3.13 1.22A4.86 4.86 0 0 0 16.61 2a4.99 4.99 0 0 0-4.79 6.2A13.87 13.87 0 0 1 1.67 2.92 5.12 5.12 0 0 0 3.2 9.67a4.82 4.82 0 0 1-2.23-.64v.07c0 2.44 1.7 4.48 3.95 4.95a4.84 4.84 0 0 1-2.22.08c.63 2.01 2.45 3.47 4.6 3.51A9.72 9.72 0 0 1 0 19.74 13.68 13.68 0 0 0 7.55 22c9.06 0 14-7.7 14-14.37v-.65c.96-.71 1.79-1.6 2.45-2.61z" />
  </svg>
);

const Facebook = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
  </svg>
);
const Instagram = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
  </svg>
);

const Linkedin = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.27 20.1H3.65V9.24h3.62V20.1zM5.47 7.76h-.03c-1.22 0-2-.83-2-1.87 0-1.06.8-1.87 2.05-1.87 1.24 0 2 .8 2.02 1.87 0 1.04-.78 1.87-2.05 1.87zM20.34 20.1h-3.63v-5.8c0-1.45-.52-2.45-1.83-2.45-1 0-1.6.67-1.87 1.32-.1.23-.11.55-.11.88v6.05H9.28s.05-9.82 0-10.84h3.63v1.54a3.6 3.6 0 0 1 3.26-1.8c2.39 0 4.18 1.56 4.18 4.89v6.21z" />
  </svg>
);

const Backlink = () => {
  return (
    <a
      href="https://web3templates.com"
      target="_blank"
      rel="noopener"
      className="absolute flex px-3 py-1 space-x-2 text-sm font-semibold text-brand-text bg-brand-bg border border-brand-taupe/30 rounded shadow-sm place-items-center left-5 bottom-5 dark:bg-trueGray-900 dark:border-trueGray-700 dark:text-trueGray-300">
      <svg
        width="20"
        height="20"
        viewBox="0 0 30 30"
        fill="none"
        className="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="29.5385" rx="2.76923" fill="#362F78" />
        <path
          d="M10.14 21.94H12.24L15.44 12.18L18.64 21.94H20.74L24.88 8H22.64L19.58 18.68L16.36 8.78H14.52L11.32 18.68L8.24 8H6L10.14 21.94Z"
          fill="#F7FAFC"
        />
      </svg>

      <span>Web3Templates</span>
    </a>
  );
};
