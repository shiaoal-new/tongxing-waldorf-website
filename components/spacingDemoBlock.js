import React from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

const SpacingBar = ({ value, label, className = "" }) => (
    <div className="flex items-center space-x-4 mb-4">
        <div className="w-24 text-xs font-mono text-brand-taupe">{label}</div>
        <div className="flex-1 flex items-center">
            <div
                className={`bg-brand-accent/20 border border-brand-accent/40 rounded-sm h-6 flex items-center justify-center text-[10px] font-bold text-brand-accent ${className}`}
                style={{ width: value }}
            >
                {value}
            </div>
        </div>
    </div>
);

const MarginDemo = () => (
    <div className="space-y-6">
        <div className="border border-brand-taupe/20 p-4 rounded-lg bg-white shadow-sm overflow-hidden">
            <h4 className="text-sm font-bold mb-4">響應式邊距 (Responsive Margins)</h4>
            <div className="relative bg-brand-bg h-40 border border-dashed border-brand-taupe/40 flex items-center justify-center">
                {/* 3XL View indicator (Ultrawide) */}
                <div className="hidden 3xl:flex absolute left-0 top-0 bottom-0 bg-brand-accent/20 w-ultrawide-margin border-r border-brand-accent/40 items-center justify-center">
                    <span className="rotate-90 text-[10px] whitespace-nowrap">ultrawide-margin (180px)</span>
                </div>
                <div className="hidden 3xl:flex absolute right-0 top-0 bottom-0 bg-brand-accent/20 w-ultrawide-margin border-l border-brand-accent/40 items-center justify-center">
                    <span className="rotate-90 text-[10px] whitespace-nowrap">ultrawide-margin (180px)</span>
                </div>

                {/* Desktop View indicator */}
                <div className="hidden lg:flex 3xl:hidden absolute left-0 top-0 bottom-0 bg-brand-accent/10 w-desktop-margin border-r border-brand-accent/30 items-center justify-center">
                    <span className="rotate-90 text-[10px] whitespace-nowrap">desktop-margin (120px)</span>
                </div>
                <div className="hidden lg:flex 3xl:hidden absolute right-0 top-0 bottom-0 bg-brand-accent/10 w-desktop-margin border-l border-brand-accent/30 items-center justify-center">
                    <span className="rotate-90 text-[10px] whitespace-nowrap">desktop-margin (120px)</span>
                </div>

                {/* Mobile View indicator */}
                <div className="lg:hidden absolute left-0 top-0 bottom-0 bg-brand-accent/20 w-mobile-margin border-r border-brand-accent/30 flex items-center justify-center">
                </div>
                <div className="lg:hidden absolute right-0 top-0 bottom-0 bg-brand-accent/20 w-mobile-margin border-l border-brand-accent/30 flex items-center justify-center">
                </div>

                <div className="bg-brand-structural/10 border border-brand-structural/30 h-16 w-full mx-mobile-margin lg:mx-desktop-margin 3xl:mx-ultrawide-margin flex items-center justify-center text-xs text-brand-structural font-medium text-center px-4">
                    Content Block (Default Block Max-Width: 1200px / Page Container: Uncapped)
                </div>
            </div>
            <p className="mt-4 text-xs text-brand-taupe italic">
                * 超大螢幕使用 `px-ultrawide-margin` (180px)。桌機版為 `px-desktop-margin` (120px)。
            </p>
        </div>
    </div>
);

const ComponentSpacingDemo = () => (
    <div className="border border-brand-taupe/20 p-6 rounded-lg bg-white shadow-sm">
        <h4 className="text-sm font-bold mb-6 text-center">組件與段落垂直間距 (Vertical Spacing)</h4>

        <div className="space-y-component">
            <div className="bg-brand-structural/5 p-4 rounded border border-brand-structural/10">
                <h5 className="text-lg font-bold mb-paragraph">標題與首段 (Spacing: Component)</h5>
                <div className="h-8 bg-brand-accent/10 border border-brand-accent/20 mb-paragraph flex items-center justify-center text-[10px] font-bold">
                    gap-component / mb-component (32px)
                </div>
                <div className="space-y-paragraph">
                    <p className="text-sm border-l-2 border-brand-taupe/30 pl-3">第一段文字內容。段落與段落之間保留 24px 的呼吸空間。</p>
                    <div className="h-6 bg-brand-accent/5 border border-brand-accent/10 flex items-center justify-center text-[10px]">
                        space-y-paragraph (24px)
                    </div>
                    <p className="text-sm border-l-2 border-brand-taupe/30 pl-3">第二段文字內容。這種間距感能顯著提升長文閱讀的舒適度。</p>
                </div>
            </div>

            <div className="flex items-center justify-center">
                <div className="h-24 w-1/2 bg-brand-accent/10 border border-brand-accent/20 flex flex-col items-center justify-center text-[10px]">
                    <div className="font-bold">SECTION GAP</div>
                    <div>100px</div>
                    <div className="mt-1 opacity-60">py-section / my-section</div>
                </div>
            </div>

            <div className="bg-brand-structural/5 p-4 rounded border border-brand-structural/10">
                <h5 className="text-lg font-bold mb-paragraph">下一個區塊</h5>
                <p className="text-sm">保持區塊間的大留白（100px），是華德福設計系統中「呼吸感」的核心體現。</p>
            </div>
        </div>
    </div>
);

const WideLayoutDemo = () => (
    <div className="border border-brand-taupe/20 p-6 rounded-lg bg-white shadow-sm overflow-hidden">
        <h4 className="text-sm font-bold mb-6">橫向佈局策略 (Horizontal Strategies)</h4>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="border rounded-xl p-4 bg-brand-bg">
                <div className="text-[10px] font-bold text-brand-accent mb-2">MD / LG GRID (2-3 Cols)</div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 bg-brand-structural/20 rounded"></div>
                    <div className="h-12 bg-brand-structural/20 rounded"></div>
                </div>
            </div>
            <div className="border rounded-xl p-4 bg-brand-bg border-brand-accent/40">
                <div className="text-[10px] font-bold text-brand-accent mb-2">XL / 3XL GRID (4-6 Cols)</div>
                <div className="grid grid-cols-4 3xl:grid-cols-6 gap-2">
                    <div className="h-12 bg-brand-accent/20 rounded"></div>
                    <div className="h-12 bg-brand-accent/20 rounded"></div>
                    <div className="h-12 bg-brand-accent/20 rounded"></div>
                    <div className="h-12 bg-brand-accent/20 rounded"></div>
                    <div className="hidden 3xl:block h-12 bg-brand-accent/20 rounded"></div>
                    <div className="hidden 3xl:block h-12 bg-brand-accent/20 rounded"></div>
                </div>
            </div>
        </div>
        <p className="mt-4 text-xs text-brand-taupe">
            當水平空間足夠時，系統會自動注入更多欄位，減少頁面長度並增加資訊對比效率。
        </p>
    </div>
);

const TypographySpacingDemo = () => (
    <div className="border border-brand-taupe/20 p-6 rounded-lg bg-white shadow-sm">
        <h4 className="text-sm font-bold mb-6">文字細節 (Type Details)</h4>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h5 className="text-xs font-bold text-brand-taupe uppercase">行高示範 (Line Height: 1.8)</h5>
                <div className="p-4 bg-brand-bg rounded leading-brand text-sm md:text-base">
                    這是一段示範文字。我們採用更寬鬆的行高（1.8），讓文字行與行之間有足夠的空間，特別是在寬螢幕下，較長的行寬需要更高的行高來維持閱讀焦點。
                </div>
            </div>
            <div className="space-y-4">
                <h5 className="text-xs font-bold text-brand-taupe uppercase">字距示範 (Letter Spacing: 0.05em)</h5>
                <div className="p-4 bg-brand-bg rounded tracking-brand">
                    這是一段示範文字。微調的字距增加了一種通透感，特別是在標題與引言中，能展現出更精緻的人文精神。
                </div>
            </div>
        </div>
    </div>
);

export default function SpacingDemoBlock({ data }) {
    const { category } = data;

    return (
        <div className="w-full max-w-brand mx-auto py-4">
            {category === "page_margins" && <MarginDemo />}
            {category === "component_spacing" && <ComponentSpacingDemo />}
            {category === "wide_layout" && <WideLayoutDemo />}
            {category === "typography" && <TypographySpacingDemo />}
        </div>
    );
}
