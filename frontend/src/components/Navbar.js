import Link from "next/link";
import Logo from "./Logo";
import { Disclosure } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import AboutModal from "./AboutModal";
import DevComment from "./DevComment";
import { useSession } from "../context/SessionContext";
import { useUXTestMode } from "../context/UXTestModeContext";

// Modularized Components
import UserMenu from "./Navbar/UserMenu";
import { NavbarListItem, MobileNavbarItem } from "./Navbar/NavbarItems";
import { ScrollLock, NavBarContainer } from "./Navbar/NavbarLayout";

export default function Navbar({ pages = [], navigation: customNavigation, isHeroPage = true }) {
  const { session } = useSession();
  const { isTestMode, toggleTestMode } = useUXTestMode();
  const [scroll, setScroll] = useState(!isHeroPage);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const router = useRouter();
  const [showBackgroundGrid, setShowBackgroundGrid] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debug_background_grid');
      if (saved) setShowBackgroundGrid(saved === 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug_background_grid', showBackgroundGrid.toString());
      // Dispatch custom event to notify ParallaxBackground
      window.dispatchEvent(new CustomEvent('debugGridToggle', { detail: showBackgroundGrid }));
    }
  }, [showBackgroundGrid]);

  const resolveItem = (item) => {
    let resolvedTitle = item.title;
    let resolvedPath = item.path;

    if (item.slug) {
      const page = pages.find(p => p.slug === item.slug);
      if (page) {
        if (!resolvedTitle) resolvedTitle = page.title;
        if (!resolvedPath) resolvedPath = item.slug === 'index' ? '/' : `/${item.slug}`;
      }
    }

    const resolvedChildren = item.children ? item.children.map(resolveItem) : undefined;

    return {
      ...item,
      title: resolvedTitle,
      path: resolvedPath,
      children: resolvedChildren
    };
  };

  const isDev = process.env.NODE_ENV === 'development';
  const navigation = (customNavigation?.items || [])
    .filter(item => isDev || !item.debugOnly)
    .map(resolveItem);

  const finalNavigation = navigation.length > 0 ? navigation : [
    { title: "首頁", path: "/" },
    ...pages
      .filter(page => page.slug !== "index")
      .map(page => ({
        title: page.title,
        path: `/${page.slug}`
      }))
  ];

  const actionHandlers = {
    showAbout: () => setShowAboutModal(true),
    toggleGrid: (current) => setShowBackgroundGrid(!current),
    toggleUXTest: () => toggleTestMode(),
    themeList: 'THEME_LIST_COMPONENT' // Special marker
  };

  useEffect(() => {
    const handleScroll = () => {
      // If not a hero page, always show background
      if (!isHeroPage) {
        setScroll(true);
        return;
      }

      // Check if scroll position is greater than viewport height
      if (window.scrollY > window.innerHeight - 100) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };

    // Initialize state
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHeroPage]);

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <ScrollLock isOpen={open} />
          <NavBarContainer
            open={open}
            scroll={scroll}
            onClick={(e) => {
              if (!e.target.closest("a") && !e.target.closest("button")) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}>
            <nav className="w-full mx-auto relative flex flex-wrap items-center justify-between px-mobile-margin lg:px-desktop-margin py-4 z-10">
              <DevComment text="Navbar Logo Section" />
              {/* Logo  */}

              <div className="flex flex-wrap items-center justify-between w-full lg:w-auto relative z-10">
                <Link
                  href="/"
                  className="flex items-center space-x-3 group transition-all duration-500 ease-out py-1">
                  <Logo className="transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" />
                  <div className="flex flex-col -space-y-1">
                    <span className="text-2xl font-medium tracking-wider text-brand-accent dark:text-brand-bg font-accent">
                      同心華德福
                    </span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-accent/70 dark:text-brand-bg/60 transition-all duration-700">
                      Tongxing Waldorf
                    </span>
                  </div>
                </Link>

                <Disclosure.Button
                  aria-label="Toggle Menu"
                  className="btn btn-ghost btn-sm px-2 ml-auto text-brand-taupe lg:hidden hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:text-brand-taupe dark:focus:bg-trueGray-700">
                  <svg
                    className="w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    {open && (
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                      />
                    )}
                    {!open && (
                      <path
                        fillRule="evenodd"
                        d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                      />
                    )}
                  </svg>
                </Disclosure.Button>

                <AnimatePresence>
                  {open && (
                    <Disclosure.Panel
                      static
                      as={motion.div}
                      initial={{ x: "100%", opacity: 0 }}
                      animate={{
                        x: 0,
                        opacity: 1,
                        transition: { delay: 0, duration: 0.3, ease: "easeInOut" },
                      }}
                      exit={{
                        x: "100%",
                        opacity: 0,
                        transition: { duration: 0.5, ease: "easeInOut" },
                      }}
                      className="absolute top-full left-0 w-full z-[100] overscroll-contain flex flex-col my-5 lg:hidden bg-brand-bg/80 dark:bg-brand-structural/80 backdrop-blur-md rounded-lg p-4 shadow-xl border border-brand-bg/20"
                    >
                      <>
                        <ul className="menu bg-transparent w-full space-y-1">
                          {finalNavigation.map((item, index) => (
                            <MobileNavbarItem
                              key={index}
                              item={item}
                              router={router}
                              actionHandlers={actionHandlers}
                              showBackgroundGrid={showBackgroundGrid}
                            />
                          ))}
                        </ul>
                        <div className="mt-4 border-t border-brand-taupe/10 pt-4">
                          <UserMenu session={session} isMobile />
                        </div>
                      </>
                    </Disclosure.Panel>
                  )}
                </AnimatePresence>
              </div>

              <DevComment text="Desktop Navigation Menu" />
              {/* menu  */}

              <div className="hidden text-center lg:flex lg:items-center">
                <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
                  {finalNavigation.map((menu, index) => (
                    <li className="mr-3 nav__item" key={index}>
                      <NavbarListItem
                        item={menu}
                        actionHandlers={actionHandlers}
                        showBackgroundGrid={showBackgroundGrid}
                      />
                    </li>
                  ))}
                </ul>
                <UserMenu session={session} />
              </div>

            </nav>
            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
          </NavBarContainer>
          <AnimatePresence>
            {open && (
              <Disclosure.Button
                as={motion.div}
                static
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="fixed inset-0 z-40 bg-black/80 w-full h-full touch-none cursor-default"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  );
}
