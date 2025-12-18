import Link from "next/link";
import ThemeChanger from "./DarkSwitch";
import Image from "next/image"
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { useEffect, useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/solid";
import AboutModal from "./about-modal";

export default function Navbar({ pages = [], isHeroPage = true }) {
  const [scroll, setScroll] = useState(!isHeroPage);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const navigation = [
    { name: "首頁", href: "/" },
    ...pages.map(page => ({
      name: page.title,
      href: `/p/${page.slug}`
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
            className={`fixed w-full z-50 left-0 top-0 transition-all duration-300 ${!open && scroll ? "bg-white/60 dark:bg-gray-900 shadow-lg backdrop-blur-md" : "bg-transparent"
              }`}>
            <nav className="container relative flex flex-wrap items-center justify-between p-8 mx-auto lg:justify-between xl:px-0">
              {/* Logo  */}
              <div className="flex flex-wrap items-center justify-between w-full lg:w-auto relative z-10">
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-2xl font-medium text-primary-500 dark:text-gray-100">
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
                  className="px-2 py-1 ml-auto text-gray-500 rounded-md lg:hidden hover:text-primary-500 focus:text-primary-500 focus:bg-primary-100 focus:outline-none dark:text-gray-300 dark:focus:bg-trueGray-700">
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
                      className="absolute top-full left-0 w-full z-[100] overscroll-contain flex flex-wrap my-5 lg:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-lg p-4 shadow-xl border border-white/20"
                    >
                      <>
                        {navigation.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href || "/"}
                            className="w-full px-4 py-2 -ml-4 text-gray-500 rounded-md dark:text-gray-300 hover:text-primary-500 focus:text-primary-500 focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700"
                          >
                            {item.name || item}
                          </Link>
                        ))}
                        <Link
                          href="/visit"
                          className="w-full px-6 py-2 mt-3 text-center text-white bg-primary-600 rounded-md lg:ml-5"
                        >
                          預約參觀
                        </Link>

                        <div className="w-full mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                          <Disclosure>
                            {({ open }) => (
                              <>
                                <Disclosure.Button className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-500 rounded-md dark:text-gray-300 hover:text-primary-500 focus:text-primary-500 focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700">
                                  <span>Debug</span>
                                  <ChevronDownIcon
                                    className={`${open ? "transform rotate-180" : ""
                                      } w-5 h-5`}
                                  />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-2 pb-2 text-sm text-gray-500">
                                  <button
                                    onClick={() => setShowAboutModal(true)}
                                    className="w-full px-4 py-2 text-left text-gray-500 rounded-md dark:text-gray-300 hover:text-primary-500 focus:text-primary-500 focus:bg-primary-100 focus:outline-none dark:focus:bg-trueGray-700"
                                  >
                                    About this site
                                  </button>
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
                      <Link
                        href={menu.href || "/"}
                        className="inline-block px-4 py-2 text-lg font-normal text-gray-800 no-underline rounded-md dark:text-gray-200 hover:text-primary-500 focus:text-primary-500 focus:bg-primary-100 focus:outline-none">
                        {menu.name || menu}
                      </Link>
                    </li>
                  ))}
                  <li className="mr-3 nav__item">
                    <DebugMenu onOpenModal={() => setShowAboutModal(true)} />
                  </li>
                </ul>
              </div>

              <div className="hidden mr-3 space-x-3 lg:flex nav__item">
                <Link
                  href="/visit"
                  className="px-6 py-2 text-white bg-primary-600 rounded-md md:ml-5">
                  預約參觀
                </Link>

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
            <Menu.Button className="inline-flex items-center px-4 py-2 text-lg font-normal text-gray-800 no-underline rounded-md dark:text-gray-200 hover:text-primary-500 focus:text-primary-500 focus:bg-primary-100 focus:outline-none">
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
            <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:divide-gray-700">
              <div className="px-1 py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? "bg-primary-500 text-white" : "text-gray-900 dark:text-gray-200"
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      onClick={onOpenModal}
                    >
                      About this site
                    </button>
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


