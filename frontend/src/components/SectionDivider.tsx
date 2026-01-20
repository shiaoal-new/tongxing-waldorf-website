import React from "react";

interface SectionDividerProps {
    type?: 'wave' | 'curve' | 'slope' | 'mountain';
    position?: 'top' | 'bottom';
    color?: string;
    flip?: boolean;
    className?: string;
    zIndex?: string;
}

/**
 * SectionDivider - 用於區塊之間的高級 SVG 有機曲線分割線
 * 
 * @param {string} type - 曲線類型: 'wave', 'curve', 'slope', 'mountain'
 * @param {string} position - 位置: 'top' | 'bottom'
 * @param {string} color - SVG 的填充顏色 (Tailwind class 如 'fill-brand-bg')
 * @param {boolean} flip - 是否水平翻轉
 */
export default function SectionDivider({
    type = "wave",
    position = "bottom",
    color = "fill-brand-bg",
    flip = false,
    className = "",
    zIndex = "z-10"
}: SectionDividerProps) {
    const isTop = position === "top";

    // 定義不同的曲線路徑
    const paths: Record<string, React.ReactElement> = {
        // 自然波浪
        wave: (
            <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,112C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        ),
        // 平緩曲線
        curve: (
            <path d="M0,160L80,170.7C160,181,320,203,480,186.7C640,171,800,117,960,106.7C1120,96,1280,128,1360,144L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        ),
        // 簡潔坡度
        slope: (
            <path d="M0,224L1440,32L1440,320L0,320Z"></path>
        )
    };

    const selectedPath = paths[type] || paths.wave;

    return (
        <div
            className={`absolute left-0 w-full overflow-hidden leading-[0] ${zIndex} pointer-events-none ${isTop ? "top-0" : "bottom-0"
                } ${isTop ? "rotate-180" : ""} ${flip ? "-scale-x-100" : ""} ${className}`}
        >
            <svg
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                className={`relative block w-full h-[40px] md:h-[100px] ${color}`}
            >
                {selectedPath}
            </svg>
        </div>
    );
}
