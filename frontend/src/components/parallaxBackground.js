import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

export default function ParallaxBackground({ src }) {
    const containerRef = useRef(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    // 1. Get Image Dimensions to calculate Aspect Ratio
    useEffect(() => {
        if (!src) return;
        const img = new Image();
        img.onload = () => {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = src;
    }, [src]);

    // 2. Track Window Size
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 3. Scroll hook
    const { scrollYProgress } = useScroll(); // 0 to 1 based on window scroll

    // 4. Calculate Dimensions
    // Requirement 1: "Ensure picture width equals container width" (Primary)
    // Requirement 2: "No white space" (Constraint) -- This implies if height calculation is insufficient, we must scale up.

    let bgWidth = windowSize.width;
    const imageAspectRatio = imageDimensions.width > 0 ? imageDimensions.height / imageDimensions.width : 0;
    let bgHeight = bgWidth * imageAspectRatio;

    // Check if calculated height is enough to cover the screen
    // Add a large buffer (300px) to account for mobile browser dynamic toolbars
    const minHeight = windowSize.height + 300;

    if (bgHeight < minHeight) {
        // If image is too short, we MUST scale it up to cover vertical space + buffer
        bgHeight = minHeight;
        bgWidth = bgHeight / imageAspectRatio;
    }

    // 5. Calculate Parallax Shift (Fixed Position Strategy)
    // Add overshoot (+100px) to ensure image extends below viewport even at full scroll
    // This protects against Safari bottom bar resizing issues.
    const targetShift = windowSize.height - bgHeight + 100;
    const y = useTransform(scrollYProgress, [0, 1], [0, targetShift]);

    // Center horizontally if wider than window
    const x = (windowSize.width - bgWidth) / 2;

    // Debugging Logs
    useEffect(() => {
        if (windowSize.width === 0) return;

        console.log('[Parallax Debug]', {
            windowWidth: windowSize.width,
            windowHeight: windowSize.height,
            imageWidth: imageDimensions.width,
            imageHeight: imageDimensions.height,
            calculatedBgWidth: bgWidth,
            calculatedBgHeight: bgHeight,
            targetShift: targetShift,
            documentHeight: document.documentElement.scrollHeight
        });
    }, [windowSize, imageDimensions, bgWidth, bgHeight, targetShift]);

    if (windowSize.width === 0 || imageDimensions.width === 0) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="fixed top-0 left-0 w-full h-[120vh] -z-10 overflow-hidden pointer-events-none bg-brand-bg dark:bg-brand-structural"
        >
            <motion.div
                style={{
                    y,
                    x,
                    width: bgWidth,  // Explicit pixel width from Window
                    height: bgHeight, // Explicit pixel height from Aspect Ratio
                }}
                className="absolute top-0 left-0 opacity-100 dark:opacity-30 will-change-transform"
            >
                <img
                    src={src}
                    alt=""
                    className="w-full h-full"
                    style={{
                        objectFit: 'cover', // ensure it fills the calculated box
                        objectPosition: 'top center',
                    }}
                />
            </motion.div>

            {/* Dark mode overlay */}
            <div className="absolute inset-0 bg-black/0 dark:bg-black/20 -z-10" />
        </div>
    );
}
