import React from 'react';
import DevComment from '../ui/DevComment';
import { useTableOfContents } from '../../hooks/useTableOfContents';
import DesktopTOC from './toc/DesktopTOC';
import MobileTOC from './toc/MobileTOC';

const TableOfContents = ({ sections }) => {

    // Hook handles state, valid sections filtering, and scroll/IO observers
    const { activeId, showTOC, validSections, scrollToSection } = useTableOfContents(sections);

    if (validSections.length === 0) {
        return null;
    }

    return (
        <>
            <DevComment text="Desktop Table of Contents" />
            <DesktopTOC
                validSections={validSections}
                activeId={activeId}
                scrollToSection={scrollToSection}
                showTOC={showTOC}
            />

            <DevComment text="Mobile Table of Contents - UI/UX Pro Max Enhanced" />
            <MobileTOC
                validSections={validSections}
                activeId={activeId}
                scrollToSection={scrollToSection}
                showTOC={showTOC}
            />
        </>
    );
};

export default TableOfContents;
