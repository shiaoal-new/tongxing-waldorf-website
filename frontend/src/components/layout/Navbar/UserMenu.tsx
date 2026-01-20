import React, { Fragment } from "react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { useSession } from "../../../context/SessionContext";

interface UserMenuProps {
    session: any;
    isMobile?: boolean;
}

const MenuButton = Menu.Button as any;
const MenuItems = Menu.Items as any;
const MenuItem = Menu.Item as any;

export default function UserMenu({ session, isMobile = false }: UserMenuProps) {
    const { loginWithLine, logout } = useSession() as any;

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
                            onClick={() => logout()}
                            className="btn btn-outline btn-sm btn-error w-full">
                            登出
                        </button>
                    </div>
                ) : (
                    <Menu as="div" className="relative inline-block text-left">
                        <MenuButton className="flex items-center focus:outline-none">
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
                        </MenuButton>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <MenuItems className="absolute right-0 w-48 mt-2 origin-top-right bg-brand-bg rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-brand-structural border border-brand-taupe/10">
                                <div className="py-1">
                                    <MenuItem>
                                        {({ active }) => (
                                            <button
                                                onClick={() => logout()}
                                                className={`${active ? "bg-brand-accent/10 text-brand-accent" : "text-brand-text dark:text-brand-bg"
                                                    } group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                                            >
                                                登出
                                            </button>
                                        )}
                                    </MenuItem>
                                </div>
                            </MenuItems>
                        </Transition>
                    </Menu>
                )}
            </div>
        );
    }

    return (
        <div className={`${isMobile ? "px-3 py-2" : "ml-3"}`}>
            <button
                onClick={() => loginWithLine()}
                className={`btn btn-primary ${isMobile ? "w-full" : "btn-sm px-6"}`}>
                登入
            </button>
        </div>
    );
}
