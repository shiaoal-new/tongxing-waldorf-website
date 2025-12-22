import React from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

const ColorBrick = ({ shade, hex }) => {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isDark = (hex) => {
        if (!hex) return false;
        const c = hex.substring(1);
        const rgb = parseInt(c, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 128;
    };

    return (
        <div
            className="group relative flex flex-col flex-1 min-w-[70px] cursor-pointer"
            onClick={() => copyToClipboard(hex)}
        >
            <div
                className="h-20 p-2 flex flex-col justify-between transition-transform group-hover:scale-[1.02]"
                style={{ backgroundColor: hex }}
            >
                <span className={`text-[10px] font-bold ${isDark(hex) ? "text-white/70" : "text-black/40"}`}>
                    {shade}
                </span>
                <span className={`text-[10px] font-mono uppercase ${isDark(hex) ? "text-white/90" : "text-black/80"}`}>
                    {hex}
                </span>
            </div>
            {copied && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-[10px] font-bold backdrop-blur-[2px]">
                    COPIED!
                </div>
            )}
        </div>
    );
};

const ColorScale = ({ colors, label }) => {
    if (!colors) return null;
    return (
        <div className="mb-6 last:mb-0">
            <div className="flex bg-white rounded-sm overflow-hidden shadow-sm border border-gray-100">
                {typeof colors === 'string' ? (
                    <ColorBrick shade="Default" hex={colors} />
                ) : (
                    Object.entries(colors).map(([shade, hex]) => (
                        <ColorBrick key={shade} shade={shade} hex={hex} />
                    ))
                )}
            </div>
            {label && <p className="text-[10px] mt-2 text-gray-400 font-semibold tracking-wide uppercase">{label}</p>}
        </div>
    );
};

const ColorRow = ({ title, subtitle, children }) => {
    return (
        <div className="flex flex-col md:flex-row mb-16 last:mb-0">
            <div className="w-full md:w-56 mb-4 md:mb-0 pr-8">
                <h2 className="text-2xl font-bold text-[#333333] leading-none mb-1">{title}</h2>
                <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">{subtitle}</p>
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
};

export default function ColorPaletteBlock({ data }) {
    const themeColors = fullConfig.theme.colors;

    const filterShades = (colorObj) => {
        if (!colorObj) return {};
        if (typeof colorObj === 'string') return { "Default": colorObj };
        const result = {};
        const shades = ['50', '200', '500', '800', '950'];
        shades.forEach(s => {
            if (colorObj[s]) result[s] = colorObj[s];
        });
        return result;
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-12">
            <div className="space-y-12">
                <ColorRow title="主色" subtitle="Brand Primary">
                    <ColorScale
                        label="Tunghin Amber / 同心暖陽"
                        colors={{ "Default": themeColors['brand-accent'] }}
                    />
                    <ColorScale
                        label="Forest Green / 森林深綠"
                        colors={{ "Default": themeColors['brand-structural'] }}
                    />
                </ColorRow>

                <ColorRow title="中性色" subtitle="Neutral">
                    <ColorScale
                        label="Paper White & Charcoal"
                        colors={{
                            "Paper White": themeColors['brand-bg'],
                            "Charcoal": themeColors['brand-text']
                        }}
                    />
                    <ColorScale
                        label="Neutral Scale (Stone)"
                        colors={themeColors.neutral}
                    />
                </ColorRow>

                <ColorRow title="功能色" subtitle="Semantic">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ColorScale label="Success" colors={filterShades(themeColors.success)} />
                        <ColorScale label="Warning" colors={filterShades(themeColors.warning)} />
                        <ColorScale label="Error" colors={filterShades(themeColors.error)} />
                        <ColorScale label="Info" colors={filterShades(themeColors.info)} />
                    </div>
                </ColorRow>

                <ColorRow title="輔助色" subtitle="Secondary / Accent">
                    <ColorScale
                        label="Brand Accents"
                        colors={{
                            "Morning Gold": themeColors['brand-gold'],
                            "Earthy Taupe": themeColors['brand-taupe'],
                            "Ethereal Blue": themeColors['brand-blue']
                        }}
                    />
                    <ColorScale
                        label="Secondary Scale (Indigo)"
                        colors={themeColors.secondary}
                    />
                </ColorRow>
            </div>
        </div>
    );
}
