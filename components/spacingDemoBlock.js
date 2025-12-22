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
            <div className="relative bg-brand-bg h-32 border border-dashed border-brand-taupe/40 flex items-center justify-center">
                {/* Desktop View indicator */}
                <div className="hidden lg:flex absolute left-0 top-0 bottom-0 bg-brand-accent/10 w-desktop-margin border-r border-brand-accent/30 items-center justify-center">
                    <span className="rotate-90 text-[10px] whitespace-nowrap">desktop-margin</span>
                </div>
                <div className="hidden lg:flex absolute right-0 top-0 bottom-0 bg-brand-accent/10 w-desktop-margin border-l border-brand-accent/30 items-center justify-center">
                    <span className="rotate-90 text-[10px] whitespace-nowrap">desktop-margin</span>
                </div>

                {/* Mobile View indicator */}
                <div className="lg:hidden absolute left-0 top-0 bottom-0 bg-brand-accent/20 w-mobile-margin border-r border-brand-accent/30 flex items-center justify-center">
                </div>
                <div className="lg:hidden absolute right-0 top-0 bottom-0 bg-brand-accent/20 w-mobile-margin border-l border-brand-accent/30 flex items-center justify-center">
                </div>

                <div className="bg-brand-structural/10 border border-brand-structural/30 h-16 w-full mx-mobile-margin lg:mx-desktop-margin flex items-center justify-center text-xs text-brand-structural font-medium">
                    Content Area (Max-Width: 1200px)
                </div>
            </div>
            <p className="mt-4 text-xs text-brand-taupe italic">
                * 桌機版使用 `px-desktop-margin` ({fullConfig.theme.spacing['desktop-margin']})，手機版自動切換為 `px-mobile-margin` ({fullConfig.theme.spacing['mobile-margin']})。
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
                <div className="h-6 bg-brand-accent/10 border border-brand-accent/20 mb-paragraph flex items-center justify-center text-[10px]">
                    gap-component / mb-component (24px)
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
                <div className="h-20 w-1/2 bg-brand-accent/10 border border-brand-accent/20 flex flex-col items-center justify-center text-[10px]">
                    <div className="font-bold">SECTION GAP</div>
                    <div>80px - 100px</div>
                </div>
            </div>

            <div className="bg-brand-structural/5 p-4 rounded border border-brand-structural/10">
                <h5 className="text-lg font-bold mb-paragraph">下一個區塊</h5>
                <p className="text-sm">保持區塊間的大留白（80px+），是華德福設計系統中「呼吸感」的核心體現。</p>
            </div>
        </div>
    </div>
);

const TypographySpacingDemo = () => (
    <div className="border border-brand-taupe/20 p-6 rounded-lg bg-white shadow-sm">
        <h4 className="text-sm font-bold mb-6">文字細節 (Type Details)</h4>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h5 className="text-xs font-bold text-brand-taupe uppercase">行高示範 (Line Height: 1.7)</h5>
                <div className="p-4 bg-brand-bg rounded leading-brand">
                    這是一段示範文字。我們採用較寬鬆的行高（1.7），讓文字行與行之間有足夠的空間，避免視覺上的壓迫感，符合教育場域溫潤、平靜的特質。
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
        <div className="w-full max-w-4xl mx-auto py-4">
            {category === "page_margins" && <MarginDemo />}
            {category === "component_spacing" && <ComponentSpacingDemo />}
            {category === "typography" && <TypographySpacingDemo />}
        </div>
    );
}
