import Link from "next/link";
import ThemeChanger from "./DarkSwitch";
import Image from "next/image"
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/solid";
import AboutModal from "./about-modal";

export default function Navbar({ pages = [], navigation: customNavigation, isHeroPage = true }) {
  const [scroll, setScroll] = useState(!isHeroPage);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const router = useRouter();

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

  const navigation = customNavigation?.items?.map(resolveItem) || [
    { title: "首頁", path: "/" },
    ...pages
      .filter(page => page.slug !== "index")
      .map(page => ({
        title: page.title,
        path: `/${page.slug}`
      }))
  ];

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
          <div
            onClick={(e) => {
              if (!e.target.closest("a") && !e.target.closest("button")) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={`fixed w-full z-50 left-0 top-0 transition-all duration-300 ${!open && scroll ? "bg-brand-bg/60 dark:bg-brand-structural shadow-lg backdrop-blur-md" : "bg-transparent"
              }`}>
            <nav className="max-w-brand mx-auto relative flex flex-wrap items-center justify-between px-mobile-margin lg:px-desktop-margin py-4">
              {/* Logo  */}
              <div className="flex flex-wrap items-center justify-between w-full lg:w-auto relative z-10">
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-2xl font-medium text-brand-accent dark:text-brand-bg micro-hover-flow">
                  <span>
                    <img
                      src="/img/logo.svg"
                      alt="N"
                      width="32"
                      height="32"
                      className="w-8"
                    />
                  </span>
                  <span>同心華德福</span>
                </Link>

                <Disclosure.Button
                  aria-label="Toggle Menu"
                  className="px-2 py-1 ml-auto text-brand-taupe rounded-md lg:hidden hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:text-brand-taupe dark:focus:bg-trueGray-700">
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
                        transition: { delay: 0.5, duration: 0.5, ease: "easeInOut" },
                      }}
                      exit={{
                        x: "100%",
                        opacity: 0,
                        transition: { duration: 0.5, ease: "easeInOut" },
                      }}
                      className="absolute top-full left-0 w-full z-[100] overscroll-contain flex flex-wrap my-5 lg:hidden bg-brand-bg/80 dark:bg-brand-structural/80 backdrop-blur-md rounded-lg p-4 shadow-xl border border-brand-bg/20"
                    >
                      <>
                        {navigation.map((item, index) => (
                          <MobileNavbarItem key={index} item={item} router={router} />
                        ))}

                        <div className="w-full mt-4 border-t border-brand-taupe/20 dark:border-brand-structural pt-4">
                          <Disclosure>
                            {({ open }) => (
                              <>
                                <Disclosure.Button className="flex items-center justify-between w-full px-4 py-2 text-left text-brand-taupe rounded-md dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700">
                                  <span>Debug</span>
                                  <ChevronDownIcon
                                    className={`${open ? "transform rotate-180" : ""
                                      } w-5 h-5`}
                                  />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-2 pb-2 text-sm text-brand-taupe">
                                  <button
                                    onClick={() => { setShowAboutModal(true); }}
                                    className="w-full px-4 py-2 text-left text-brand-taupe rounded-md dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700"
                                  >
                                    About this site
                                  </button>
                                  <Link
                                    href="/admin/index.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full px-4 py-2 text-left text-brand-taupe rounded-md dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700 block"
                                  >
                                    CMS 後台管理
                                  </Link>
                                </Disclosure.Panel>
                              </>
                            )}
                          </Disclosure>
                        </div>
                      </>
                    </Disclosure.Panel>
                  )}
                </AnimatePresence>
              </div>

              {/* menu  */}
              <div className="hidden text-center lg:flex lg:items-center">
                <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
                  {navigation.map((menu, index) => (
                    <li className="mr-3 nav__item" key={index}>
                      <NavbarListItem item={menu} />
                    </li>
                  ))}
                  <li className="mr-3 nav__item">
                    <DebugMenu onOpenModal={() => setShowAboutModal(true)} />
                  </li>
                </ul>
              </div>

              <div className="hidden mr-3 space-x-3 lg:flex nav__item">
                <ThemeChanger />
              </div>
            </nav>
            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
          </div>
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

function NavbarListItem({ item }) {
  if (item.children && item.children.length > 0) {
    return (
      <Menu as="div" className="relative inline-block text-left group">
        {({ open }) => (
          <>
            <Menu.Button className="inline-flex items-center px-4 py-2 text-base font-normal text-brand-text no-underline rounded-md dark:text-brand-bg hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none">
              <span>{item.title}</span>
              <ChevronDownIcon
                className={`${open ? "transform rotate-180" : ""
                  } w-5 h-5 ml-1 transition-transform duration-200`}
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
                          <Link
                            href={child.path || "#"}
                            className={`${active ? "bg-brand-accent text-brand-bg" : "text-brand-text dark:text-brand-bg"
                              } flex items-center justify-between w-full px-4 py-2 text-sm transition-colors micro-hover-link`}
                          >
                            <span>{child.title}</span>
                            {child.children && child.children.length > 0 && (
                              <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                            )}
                          </Link>

                          {/* Level 2 Submenu */}
                          {child.children && child.children.length > 0 && (
                            <div className="absolute left-full top-0 w-48 ml-px bg-brand-bg dark:bg-brand-structural rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                              <div className="py-1">
                                {child.children.map((grandChild, gIdx) => (
                                  <Link
                                    key={gIdx}
                                    href={grandChild.path || "#"}
                                    className="block px-4 py-2 text-sm text-brand-text dark:text-brand-bg hover:bg-brand-accent hover:text-brand-bg transition-colors"
                                  >
                                    {grandChild.title}
                                  </Link>
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
    <Link
      href={item.path || "/"}
      className="inline-block px-4 py-2 text-base font-normal text-brand-text no-underline rounded-md dark:text-brand-bg hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none micro-hover-link">
      {item.title}
    </Link>
  );
}

function MobileNavbarItem({ item, router }) {
  if (item.children && item.children.length > 0) {
    return (
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex items-center justify-between w-full px-4 py-2 text-left text-brand-taupe rounded-md dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700">
              <span>{item.title}</span>
              <ChevronDownIcon
                className={`${open ? "transform rotate-180" : ""
                  } w-5 h-5`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-2 pb-2 text-sm text-brand-taupe">
              {item.children.map((child, idx) => (
                <div key={idx} className="mb-1">
                  {child.children && child.children.length > 0 ? (
                    <Disclosure>
                      {({ open: subOpen }) => (
                        <>
                          <Disclosure.Button className="flex items-center justify-between w-full px-4 py-2 text-left text-brand-taupe rounded-md dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700">
                            <span>{child.title}</span>
                            <ChevronDownIcon
                              className={`${subOpen ? "transform rotate-180" : ""
                                } w-4 h-4`}
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel className="px-6 pt-1 pb-1 text-xs text-brand-taupe border-l border-brand-taupe/20 ml-4">
                            {child.children.map((grandChild, gIdx) => (
                              <Disclosure.Button
                                key={gIdx}
                                as="a"
                                href={grandChild.path || "#"}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setTimeout(() => router.push(grandChild.path || "#"), 400);
                                }}
                                className="w-full px-4 py-2 text-left text-brand-taupe rounded-md dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700 block"
                              >
                                {grandChild.title}
                              </Disclosure.Button>
                            ))}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ) : (
                    <Disclosure.Button
                      as="a"
                      href={child.path || "#"}
                      onClick={(e) => {
                        e.preventDefault();
                        setTimeout(() => router.push(child.path || "#"), 400);
                      }}
                      className="w-full px-4 py-2 text-left text-brand-taupe rounded-md dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700 block"
                    >
                      {child.title}
                    </Disclosure.Button>
                  )}
                </div>
              ))}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    );
  }

  return (
    <Disclosure.Button
      as="a"
      href={item.path || "/"}
      onClick={(e) => {
        e.preventDefault();
        setTimeout(() => router.push(item.path || "/"), 400);
      }}
      className="w-full px-4 py-2 text-left text-brand-taupe rounded-md dark:text-brand-taupe hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700 block"
    >
      {item.title}
    </Disclosure.Button>
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


function DebugMenu({ onOpenModal }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="inline-flex items-center px-4 py-2 text-base font-normal text-brand-text no-underline rounded-md dark:text-brand-bg hover:text-brand-accent focus:text-brand-accent focus:bg-primary-100 focus:outline-none">
              <span>Debug</span>
              <ChevronDownIcon
                className={`${open ? "transform rotate-180" : ""
                  } w-5 h-5 ml-1 transition-transform duration-200`}
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-brand-bg divide-y divide-brand-taupe/10 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-brand-structural dark:divide-gray-700">
              <div className="px-1 py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? "bg-brand-accent text-brand-bg" : "text-brand-text dark:text-brand-bg"
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm transition-colors`}
                      onClick={onOpenModal}
                    >
                      About this site
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/admin/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${active ? "bg-brand-accent text-brand-bg" : "text-brand-text dark:text-brand-bg"
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm transition-colors`}
                    >
                      CMS 後台管理
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}


