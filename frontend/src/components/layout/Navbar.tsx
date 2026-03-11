import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import AboutModal from "../AboutModal";
import DevComment from "../ui/DevComment";
import { useSession } from "../../context/SessionContext";
import { PageData, NavigationData } from "../../types/content";
import { useWordingContext } from "../../context/WordingContext";
import { CONFIG } from "../../lib/config";

// Modularized Components
import UserMenu from "./Navbar/UserMenu";
import { NavbarListItem, MobileNavbarItem, NavbarItemType } from "./Navbar/NavbarItems";
import { ScrollLock, NavBarContainer } from "./Navbar/NavbarLayout";
import { isDevEnvironment } from "../../lib/env";
import MegaMenu from "./Navbar/MegaMenu";
import { resolveNavigationItem } from "../../lib/navigation";

interface NavbarProps {
  pages?: Partial<PageData>[];
  navigation: NavigationData;
  isHeroPage?: boolean;
}

const DisButton = Disclosure.Button as any;
const DisPanel = Disclosure.Panel as any;

export default function Navbar({ pages = [], navigation: customNavigation, isHeroPage = true }: NavbarProps) {
  const { session } = useSession() as any;
  const [scroll, setScroll] = useState(!isHeroPage);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const router = useRouter();
  const [showBackgroundGrid, setShowBackgroundGrid] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.DEBUG_GRID);
      if (saved) setShowBackgroundGrid(saved === 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONFIG.STORAGE_KEYS.DEBUG_GRID, showBackgroundGrid.toString());
      // Dispatch custom event to notify ParallaxBackground
      window.dispatchEvent(new CustomEvent('debugGridToggle', { detail: showBackgroundGrid }));
    }
  }, [showBackgroundGrid]);

  const isDev = isDevEnvironment();
  const navigationRaw = (customNavigation?.items || [])
    .filter((item: any) => isDev || !item.debugOnly);
  
  const navigationResolved = navigationRaw.map((item: any) => resolveNavigationItem(item, pages));

  const finalNavigation: NavbarItemType[] = navigationResolved.length > 0 ? navigationResolved : [
    { title: "首頁", path: "/", text: "首頁", link: "/" },
    ...pages
      .filter(page => page.slug !== "index")
      .map(page => ({
        title: page.title as string,
        path: `/${page.slug}`,
        text: page.title as string,
        link: `/${page.slug}`
      }))
  ];

  const actionHandlers = {
    showAbout: () => setShowAboutModal(true),
    toggleGrid: (current: boolean) => setShowBackgroundGrid(!current),
    themeList: 'THEME_LIST_COMPONENT', // Special marker
    wordingStyle: 'WORDING_STYLE_COMPONENT', // Special marker
    wordingContext: useWordingContext(),
    router
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
            onClick={(e: React.MouseEvent) => {
              if (
                !(e.target as HTMLElement).closest("a") &&
                !(e.target as HTMLElement).closest("button") &&
                !(e.target as HTMLElement).closest("summary") &&
                !(e.target as HTMLElement).closest("details")
              ) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}>
            <nav className="w-full mx-auto relative flex flex-wrap items-center justify-between px-mobile-margin lg:px-desktop-margin py-1 z-10">
              <DevComment text="Navbar Logo Section" />
              {/* Logo  */}

              <div className="flex flex-wrap items-center justify-between w-full lg:w-auto relative z-10">
                <Link
                  href="/"
                  className="flex items-center group transition-all duration-500 ease-out py-1">
                  <Image
                    src="/img/logo.webp"
                    alt="同心華德福 Tongxing Waldorf"
                    width={240}
                    height={48}
                    className={`h-6 sm:h-8 w-auto object-contain object-left transition-all duration-500 group-hover:scale-105 ${!scroll && !open
                      ? "opacity-60 group-hover/navbar:opacity-100 group-hover/navbar:invert dark:group-hover/navbar:invert-0"
                      : "invert dark:invert-0"
                      }`}
                    priority
                  />
                </Link>

                <DisButton
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
                </DisButton>

                <AnimatePresence>
                  {open && (
                    <DisPanel
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
                      className="absolute top-full left-0 w-full z-[100] overscroll-contain flex flex-col my-2 lg:hidden bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-lg p-4 shadow-xl border border-brand-bg/20 max-h-[80vh] overflow-y-auto"
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
                        {/* <div className="mt-4 border-t border-brand-taupe/10 pt-4">
                          <UserMenu session={session} isMobile />
                        </div> */}
                      </>
                    </DisPanel>
                  )}
                </AnimatePresence>
              </div>

              <DevComment text="Desktop Navigation Menu" />
              {/* menu  */}

              <div className="hidden text-center lg:flex lg:items-center">
                <MegaMenu
                  items={finalNavigation}
                  actionHandlers={actionHandlers}
                  showBackgroundGrid={showBackgroundGrid}
                  scroll={scroll}
                />
                {/* <UserMenu session={session} /> */}
              </div>

            </nav>
            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
          </NavBarContainer>
          <AnimatePresence>
            {open && (
              <DisButton
                as={motion.div}
                static
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="fixed inset-0 z-40 bg-brand-bg/60 dark:bg-brand-structural/60 backdrop-blur-md w-full h-full touch-none cursor-default"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  );
}
