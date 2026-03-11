import React, { useRef, useEffect } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { motion, useAnimation } from "framer-motion";
import { useSubMenuPosition } from "./utils";

export const MenuCard = ({ children, className = "", style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
    <div className={`bg-brand-bg/95 dark:bg-brand-structural/95 backdrop-blur-md rounded-md shadow-lg ring-1 ring-black/5 ${className}`} style={style}>
        {children}
    </div>
);

export const SideSubMenu = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const flipLeft = useSubMenuPosition(containerRef);

    return (
        <div
            ref={containerRef}
            className={`absolute top-0 w-[12rem] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto ${flipLeft ? 'right-full pr-1' : 'left-full pl-1'} ${className}`}
        >
            {children}
        </div>
    );
};

export const DropdownTransition = ({ 
    children, 
    shakeKey = 0, 
    wrapperClass = "absolute right-0 top-full pt-2 origin-top z-50 pointer-events-none",
    style,
    isMegaMenu = false,
    navbarHeight = 64,
}: { 
    children: React.ReactNode, 
    shakeKey?: number, 
    wrapperClass?: string,
    style?: React.CSSProperties,
    isMegaMenu?: boolean,
    navbarHeight?: number,
}) => {
    const controls = useAnimation();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (shakeKey > 0) {
            controls.start({
                y: [0, -10, 0, -5, 0],
                transition: { duration: 0.4, ease: "easeInOut" }
            });
        }
    }, [shakeKey, controls]);

    if (isMegaMenu) {
        return (
            <NavigationMenu.Content>
                {/* 
                  * This invisible anchor sits inside Radix's positioned container.
                  * The actual mega menu panel uses position:fixed to escape
                  * Radix's inline transform and span 100vw.
                  */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'visible', pointerEvents: 'none' }}>
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                            position: 'fixed',
                            top: navbarHeight,
                            left: 0,
                            right: 0,
                            width: '100vw',
                            zIndex: 50,
                            pointerEvents: 'auto',
                            paddingTop: '8px',
                            overscrollBehavior: 'contain',
                        }}
                    >
                        <motion.div animate={controls}>
                            {children}
                        </motion.div>
                    </motion.div>
                </div>
            </NavigationMenu.Content>
        );
    }

    return (
        <NavigationMenu.Content asChild>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={wrapperClass}
                style={style ?? { left: 'auto', right: 0 }}
            >
                <div className="pointer-events-auto">
                    <motion.div animate={controls}>
                        {children}
                    </motion.div>
                </div>
            </motion.div>
        </NavigationMenu.Content>
    );
};
