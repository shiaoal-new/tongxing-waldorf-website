import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

export default function ParallaxBackground({ src }) {
    const containerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [showGrid, setShowGrid] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    // Load image to get its natural dimensions
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = src;
    }, [src]);

    // Measure container height
    useEffect(() => {
        if (!containerRef.current) return;

        const updateHeight = () => {
            const height = containerRef.current.scrollHeight;
            setContainerHeight(height);
        };

        updateHeight();

        // Update on resize
        const observer = new ResizeObserver(updateHeight);
        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    // Listen for debug grid toggle
    useEffect(() => {
        const handleToggle = (e) => setShowGrid(e.detail);
        window.addEventListener('debugGridToggle', handleToggle);

        // Check initial state from localStorage
        const saved = localStorage.getItem('debug_background_grid');
        if (saved) setShowGrid(saved === 'true');

        return () => window.removeEventListener('debugGridToggle', handleToggle);
    }, []);

    // Track scroll progress of the container relative to viewport
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Calculate background dimensions maintaining aspect ratio
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

    let bgWidth = containerWidth;
    let bgHeight = containerHeight + viewportHeight * 2;

    // If we have image dimensions, maintain aspect ratio
    if (imageDimensions.width > 0 && imageDimensions.height > 0) {
        const imageAspectRatio = imageDimensions.width / imageDimensions.height;

        // Fit to container width and calculate height from aspect ratio
        bgWidth = containerWidth;
        const naturalHeight = bgWidth / imageAspectRatio;

        // Use natural height, but ensure it's at least viewport height to cover the screen initially
        // (Optional: depending on design requirement. If strict aspect ratio is key, use naturalHeight)
        bgHeight = Math.max(naturalHeight, viewportHeight);
    }

    // Calculate parallax shift
    // Goal: When scrollYProgress = 0 (top), show top of background (y = 0)
    //       When scrollYProgress = 1 (bottom), show bottom of background relative to container bottom
    //
    // At scroll=1, we want background bottom aligned with container bottom.
    // Since background starts at top (0), we need to shift it by (containerHeight - bgHeight).
    //
    // If container > bg: shift is Positive (move down), background moves slower than content
    // If container < bg: shift is Negative (move up), background moves faster than content

    // Note: containerHeight includes the whole scrollable area.
    const targetShift = containerHeight - bgHeight;
    const actualShift = useTransform(scrollYProgress, [0, 1], [0, targetShift]);

    // For debug display
    const contentScrollDistance = containerHeight - viewportHeight;
    const backgroundShiftNeeded = bgHeight - viewportHeight;
    // Speed relative to viewport scroll
    const parallaxSpeed = contentScrollDistance > 0 ? (bgHeight - viewportHeight) / contentScrollDistance : 1;

    // Generate grid lines at 10% intervals
    const gridLines = [];
    for (let i = 10; i <= 90; i += 10) {
        gridLines.push(i);
    }

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-brand-bg dark:bg-brand-structural">
            <motion.div
                style={{
                    y: actualShift,
                    height: `${bgHeight}px`,
                    width: `${bgWidth}px`,

                }}
                className="absolute top-0 opacity-100 dark:opacity-30 transition-opacity duration-700 will-change-transform"
            >
                <img
                    src={src}
                    alt=""
                    className="w-full h-full"
                    style={{
                        objectFit: 'contain',
                        objectPosition: 'top center',
                    }}
                />
            </motion.div>

            {/* Debug Grid Overlay */}
            {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    {/* Vertical lines */}
                    {gridLines.map(percent => (
                        <div
                            key={`v-${percent}`}
                            className="absolute top-0 bottom-0 border-l-2 border-red-500"
                            style={{ left: `${percent}%` }}
                        >
                            <span className="absolute top-2 -translate-x-1/2 bg-red-500 text-white text-xs px-1 rounded font-mono">
                                X:{percent}%
                            </span>
                        </div>
                    ))}

                    {/* Horizontal lines */}
                    {gridLines.map(percent => (
                        <div
                            key={`h-${percent}`}
                            className="absolute left-0 right-0 border-t-2 border-blue-500"
                            style={{ top: `${percent}%` }}
                        >
                            <span className="absolute left-2 -translate-y-1/2 bg-blue-500 text-white text-xs px-1 rounded font-mono">
                                Y:{percent}%
                            </span>
                        </div>
                    ))}

                    {/* Debug info */}
                    <div className="absolute top-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono space-y-1">
                        <div>Container: {containerWidth}x{containerHeight}px</div>
                        <div>Image: {imageDimensions.width}x{imageDimensions.height}px</div>
                        <div>BG: {Math.round(bgWidth)}x{Math.round(bgHeight)}px</div>
                        <div>BG Shift: {Math.round(backgroundShiftNeeded)}px</div>
                        <div>Speed: {parallaxSpeed.toFixed(2)}x</div>
                    </div>
                </div>
            )}

            {/* Subtle mask for dark mode readability */}
            <div className="absolute inset-0 bg-black/0 dark:bg-black/20 -z-10" />
        </div>
    );
}
