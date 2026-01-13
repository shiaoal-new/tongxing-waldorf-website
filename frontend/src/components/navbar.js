import Link from "next/link";
import ThemeChanger, { ThemeList } from "./DarkSwitch";
import Logo from "./logo";
import Image from "next/image"
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/solid";
import AboutModal from "./about-modal";
import DevComment from "./DevComment";
import { useSession, signIn, signOut } from "next-auth/react";

function UserMenu({ session, isMobile = false }) {
  if (session) {
    const userDisplay = session.user.name || session.user.email;
    return (
      <div className={`${isMobile ? "px-3 py-2" : "flex items-center ml-3"}`}>
        {isMobile ? (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 px-2 py-1">
              {session.user.image && (
                <Image src={session.user.image} alt="" width={24} height={24} className="rounded-full" />
              )}
              <span className="text-sm font-medium text-brand-taupe truncate">{userDisplay}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="btn btn-outline btn-sm btn-error w-full">
              登出
            </button>
          </div>
        ) : (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex items-center focus:outline-none">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-brand-accent/5 transition-colors border border-brand-taupe/10">
                {session.user.image ? (
                  <Image src={session.user.image} alt="" width={24} height={24} className="rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-brand-accent/20 flex items-center justify-center">
                    <span className="text-[10px] text-brand-accent font-bold">U</span>
                  </div>
                )}
                <span className="text-sm font-medium text-brand-text dark:text-brand-bg max-w-[100px] truncate">
                  {session.user.name || "使用者"}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-brand-taupe" />
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-brand-bg rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-brand-structural border border-brand-taupe/10">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut()}
                        className={`${active ? "bg-brand-accent/10 text-brand-accent" : "text-brand-text dark:text-brand-bg"
                          } group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                      >
                        登出
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    );
  }

  return (
    <div className={`${isMobile ? "px-3 py-2" : "ml-3"}`}>
      <button
        onClick={() => signIn('line')}
        className={`btn btn-primary ${isMobile ? "w-full" : "btn-sm px-6"}`}>
        登入
      </button>
    </div>
  );
}


export default function Navbar({ pages = [], navigation: customNavigation, isHeroPage = true }) {
  const { data: session } = useSession();
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
                  className="flex items-center space-x-2 text-2xl font-medium text-brand-accent dark:text-brand-bg micro-hover-flow">
                  <Logo />
                  <span>同心華德福</span>
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

function NavbarListItem({ item, actionHandlers, showBackgroundGrid }) {
  if (item.children && item.children.length > 0) {
    return (
      <Menu as="div" className="relative inline-block text-left group">
        {({ open }) => (
          <>
            <Menu.Button className="inline-flex items-center px-4 py-2 text-base font-normal text-brand-text no-underline rounded-md dark:text-brand-bg hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none group">
              <span className="micro-hover-link">{item.title}</span>
              <ChevronDownIcon
                className={`${open ? "transform rotate-180" : ""
                  } w-5 h-5 ml-1 transition-transform duration-200 group-hover:text-brand-accent`}
                aria-hidden="true"
              />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 w-48 mt-2 origin-top-left bg-brand-bg divide-y divide-brand-taupe/10 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-brand-structural dark:divide-gray-700 overflow-hidden">
                <div className="py-1">
                  {item.children.map((child, idx) => (
                    <Menu.Item key={idx}>
                      {({ active }) => (
                        <div className="relative group/sub">
                          <NavbarActionItem
                            item={child}
                            active={active}
                            actionHandlers={actionHandlers}
                            showBackgroundGrid={showBackgroundGrid}
                            className="text-sm px-4 py-2"
                          />

                          {child.children && child.children.length > 0 && (
                            <div className="absolute left-full top-0 w-48 ml-px bg-brand-bg dark:bg-brand-structural rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                              <div className="py-1">
                                {child.children.map((grandChild, gIdx) => (
                                  <NavbarActionItem
                                    key={gIdx}
                                    item={grandChild}
                                    active={false} // Handle sub-item active state if needed
                                    actionHandlers={actionHandlers}
                                    showBackgroundGrid={showBackgroundGrid}
                                    className="text-sm px-4 py-2 block w-full text-left"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    );
  }

  return (
    <NavbarActionItem
      item={item}
      active={false}
      actionHandlers={actionHandlers}
      showBackgroundGrid={showBackgroundGrid}
      className="text-base font-normal px-4 py-2"
    />
  );
}

function NavbarActionItem({ item, active, actionHandlers, showBackgroundGrid, className = "", isMobile = false, router }) {
  const baseStyles = isMobile
    ? `block rounded-md transition-all ${active
      ? 'text-brand-accent font-semibold bg-brand-accent/10'
      : 'text-brand-text dark:text-brand-bg hover:text-brand-accent hover:bg-brand-accent/5 active:bg-brand-accent/10'
    }`
    : `flex items-center justify-between transition-colors micro-hover-link rounded-md ${active
      ? "bg-brand-accent text-brand-bg"
      : "text-brand-text dark:text-brand-bg hover:text-brand-accent"
    }`;

  const combinedClassName = `${baseStyles} ${className}`;

  if (item.action) {
    if (item.action === 'themeList') {
      return (
        <div className="w-full">
          {isMobile ? (
            <details className="group/theme">
              <summary className="list-none text-sm text-brand-taupe dark:text-brand-taupe hover:text-brand-accent transition-colors cursor-pointer py-2 px-2 rounded-md hover:bg-brand-accent/5 [&::-webkit-details-marker]:hidden flex justify-between items-center w-full">
                <span>{item.title}</span>
                <ChevronDownIcon className="w-4 h-4 group-open/theme:rotate-180 transition-transform" />
              </summary>
              <ul className="menu menu-compact bg-brand-bg/50 dark:bg-brand-structural/50 rounded-lg p-0 mt-1">
                <ThemeList />
              </ul>
            </details>
          ) : (
            <div className="group/theme relative">
              <div className={combinedClassName}>
                <span>{item.title}</span>
                <ChevronDownIcon className="w-4 h-4 -rotate-90" />
              </div>
              <div className="absolute left-full top-0 w-48 ml-px bg-brand-bg dark:bg-brand-structural rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover/theme:opacity-100 group-hover/theme:visible transition-all duration-200">
                <ul className="menu menu-compact p-1">
                  <ThemeList />
                </ul>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (item.action === 'toggleGrid') {
      return (
        <div className={`${combinedClassName} flex items-center justify-between w-full`}>
          <span>{item.title}</span>
          <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="sr-only"
              checked={showBackgroundGrid}
              readOnly
            />
            <div
              onClick={() => actionHandlers.toggleGrid(showBackgroundGrid)}
              className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${showBackgroundGrid ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${showBackgroundGrid ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={actionHandlers[item.action]}
        className={`${combinedClassName} w-full text-left`}
      >
        {item.title}
      </button>
    );
  }

  const handleClick = (e) => {
    if (isMobile && router) {
      e.preventDefault();
      // Close the mobile menu immediately, then navigate
      const disclosureButton = document.querySelector('[aria-label="Toggle Menu"]');
      if (disclosureButton) disclosureButton.click();
      setTimeout(() => router.push(item.path || "#"), 300);
    }
  };

  return (
    <Link
      href={item.path || "#"}
      target={item.target}
      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
      className={combinedClassName}
      onClick={isMobile ? handleClick : undefined}
    >
      <span>{item.title}</span>
      {item.children && item.children.length > 0 && !isMobile && (
        <ChevronDownIcon className="w-4 h-4 -rotate-90" />
      )}
    </Link>
  );
}

function MobileNavbarItem({ item, router, actionHandlers, showBackgroundGrid }) {
  const isActive = router.pathname === item.path;

  if (item.children && item.children.length > 0) {
    return (
      <li>
        <details className="group">
          <summary className="list-none font-medium text-brand-text dark:text-brand-bg hover:text-brand-accent focus:text-brand-accent transition-colors cursor-pointer py-2.5 px-3 rounded-lg hover:bg-brand-accent/5 active:bg-brand-accent/10 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {item.title}
            </span>
          </summary>
          <ul className="ml-4 mt-1 space-y-0.5 border-l-2 border-brand-taupe/10 dark:border-brand-structural/30 pl-3">
            {item.children.map((child, idx) => {
              const childIsActive = router.pathname === child.path;
              return (
                <li key={idx}>
                  {child.children && child.children.length > 0 ? (
                    <details className="group/sub">
                      <summary className="list-none text-sm text-brand-taupe dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent transition-colors cursor-pointer py-2 px-2 rounded-md hover:bg-brand-accent/5 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2">
                          <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {child.title}
                        </span>
                      </summary>
                      <ul className="ml-3 mt-1 space-y-0.5 border-l border-brand-taupe/10 dark:border-brand-structural/20 pl-2">
                        {child.children.map((grandChild, gIdx) => {
                          const grandChildIsActive = router.pathname === grandChild.path;
                          return (
                            <li key={gIdx}>
                              <NavbarActionItem
                                item={grandChild}
                                active={grandChildIsActive}
                                actionHandlers={actionHandlers}
                                showBackgroundGrid={showBackgroundGrid}
                                className="text-xs py-1.5 px-2 mb-0.5"
                                isMobile
                                router={router}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  ) : (
                    <NavbarActionItem
                      item={child}
                      active={childIsActive}
                      actionHandlers={actionHandlers}
                      showBackgroundGrid={showBackgroundGrid}
                      className="text-sm py-2 px-2 mb-0.5"
                      isMobile
                      router={router}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </details>
      </li>
    );
  }

  return (
    <li>
      <NavbarActionItem
        item={item}
        active={isActive}
        actionHandlers={actionHandlers}
        showBackgroundGrid={showBackgroundGrid}
        className="font-medium py-2.5 px-3 mb-0.5"
        isMobile
        router={router}
      />
    </li>
  );
}

function ScrollLock({ isOpen }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);
  return null;
}




function NavBarContainer({ children, open, scroll, onClick }) {
  return (
    <header
      onClick={onClick}
      className={`navbar-container fixed w-full z-50 left-0 top-0 transition-all duration-300 ${!open && scroll ? "bg-transparent" : "bg-transparent"
        }`}>
      {children}
    </header>
  );
}
