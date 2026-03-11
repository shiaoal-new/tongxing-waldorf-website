import React, { useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { NavbarItemType } from "./NavbarItems";
import { isItemActive, hasActiveChild } from "../../../lib/navigation";

// Sub-components and types
import { 
    getItemStyles 
} from "./MegaMenu/utils";
import {
    ThemeListItem,
    GridToggleItem,
    WordingStyleItem,
    StandardDropdownItem,
    SimpleLinkItem,
    MegaDropdownItem
} from "./MegaMenu/ItemTypes";

interface MegaMenuProps {
    items: NavbarItemType[];
    actionHandlers: Record<string, any>;
    showBackgroundGrid: boolean;
    scroll: boolean;
}

function MegaMenuItem({ 
    item, 
    actionHandlers, 
    showBackgroundGrid, 
    scroll 
}: { item: NavbarItemType } & MegaMenuProps) {
    const router = useRouter();
    const currentPath = router.asPath.split('?')[0];
    const active = isItemActive(item, currentPath) || hasActiveChild(item, currentPath);
    const styles = getItemStyles(active, scroll);

    if (item.action === 'themeList') return <ThemeListItem item={item} styles={styles} />;
    if (item.action === 'toggleGrid') return <GridToggleItem item={item} styles={styles} showGrid={showBackgroundGrid} actionHandlers={actionHandlers} />;
    if (item.action === 'wordingStyle') return <WordingStyleItem item={item} styles={styles} actionHandlers={actionHandlers} />;

    // Items with children
    if (item.children?.length) {
        if (item.layout === 'megamenu' || item.featuredItems?.length) {
            return <MegaDropdownItem item={item} styles={styles} currentPath={currentPath} actionHandlers={actionHandlers} />;
        }
        return <StandardDropdownItem item={item} styles={styles} currentPath={currentPath} actionHandlers={actionHandlers} />;
    }

    // Standard items or generic actions
    return <SimpleLinkItem item={item} styles={styles} actionHandlers={actionHandlers} />;
}

export default function MegaMenu({ items, actionHandlers, showBackgroundGrid, scroll }: MegaMenuProps) {
    const [value, setValue] = useState("");

    return (
        <>
            <NavigationMenu.Root className="static" value={value} onValueChange={setValue}>
                <NavigationMenu.List className="static flex items-center justify-end gap-1">
                    {items.map((item, index) => (
                        <MegaMenuItem
                            key={index}
                            item={item}
                            items={items}
                            actionHandlers={actionHandlers}
                            showBackgroundGrid={showBackgroundGrid}
                            scroll={scroll}
                        />
                    ))}
                </NavigationMenu.List>
            </NavigationMenu.Root>

            <AnimatePresence>
                {value && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 w-screen h-screen z-[-1] bg-brand-bg/60 dark:bg-brand-structural/60 backdrop-blur-md pointer-events-none"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
