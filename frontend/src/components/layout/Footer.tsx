import Link from "next/link";
import React from "react";
import Container from "../ui/Container";
import Logo from "../ui/Logo";
import DevComment from "../ui/DevComment";
import { useRef } from "react";
import { useTheme } from "next-themes";
import { motion, useScroll, useTransform } from "framer-motion";

// Helper component for footer content to avoid duplication in code

function FooterContent() {
  const navigation = [
    { title: "關於我們", path: "/" },
    { title: "課程介紹", path: "/featured-courses" },
    { title: "招生資訊", path: "/visit" },
    { title: "師資團隊", path: "/teacher-group" },
    { title: "校園生活", path: "/rhythm-of-life" }
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

export default function Footer() {
  const spacerRef = useRef<HTMLDivElement>(null);
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

const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
  </svg>
);

const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
  </svg>
);
