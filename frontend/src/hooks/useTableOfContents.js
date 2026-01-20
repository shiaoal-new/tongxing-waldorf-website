import { useState, useEffect, useMemo } from 'react';

export const useTableOfContents = (sections) => {
    const [activeId, setActiveId] = useState('');
    const [showTOC, setShowTOC] = useState(false);

    // Filter out sections without IDs or Titles
    const validSections = useMemo(() => {
        return sections.filter(s => s.id && s.title);
    }, [sections]);

    // Show TOC button after scrolling past hero section
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight - 100) {
                setShowTOC(true);
            } else {
                setShowTOC(false);
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reset active ID when sections change
    useEffect(() => {
        setActiveId('');
    }, [sections]);

    // Intersection Observer for Active Section
    useEffect(() => {
        if (validSections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-40% 0px -60% 0px',
                threshold: 0
            }
        );

        const timeoutId = setTimeout(() => {
            validSections.forEach((section) => {
                const element = document.getElementById(section.id);

                if (element) {
                    observer.observe(element);
                }
            });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [validSections]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return { activeId, showTOC, validSections, scrollToSection };
};
