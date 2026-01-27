import React from "react";

const FontFamilyCard = ({ title, fontName, fontClass, exampleText }) => (
    <div className="border border-brand-taupe/20 p-6 rounded-lg bg-white shadow-sm">
        <h4 className="text-xs font-bold text-brand-taupe uppercase mb-1">{title}</h4>
        <p className="text-sm text-brand-structural font-medium mb-4">{fontName}</p>
        <div className={`p-4 bg-brand-bg rounded ${fontClass} text-2xl`}>
            {exampleText || "2025 同心華德福 Tongxing Waldorf"}
        </div>
    </div>
);

const TypeScaleRow = ({ label, desktopSize, mobileSize, weight, usage, cssClass, tag: Tag = "div" }) => (
    <div className="py-6 border-b border-brand-taupe/10 last:border-0">
        <div className="grid md:grid-cols-4 gap-4 items-center">
            <div className="col-span-1">
                <span className="text-xs px-2 py-1 bg-brand-structural/5 text-brand-structural rounded font-mono">
                    {label}
                </span>
                <div className="mt-2 text-xs text-brand-taupe">
                    <div>Desktop: {desktopSize}</div>
                    <div>Mobile: {mobileSize}</div>
                    <div>Weight: {weight}</div>
                </div>
            </div>
            <div className="col-span-2">
                <Tag className={`${cssClass} text-brand-structural truncate`}>
                    同心華德福 身心靈平衡的教育
                </Tag>
            </div>
            <div className="col-span-1 text-right">
                <span className="text-xs text-brand-taupe">{usage}</span>
            </div>
        </div>
    </div>
);


export default function TypographyDemoBlock({ data }) {
    const { category } = data;

    if (category === "font_family") {
        return (
            <div className="grid md:grid-cols-2 gap-6 py-4">
                <FontFamilyCard
                    title="標題字體 (Heading)"
                    fontName="思源宋體 (Noto Serif TC)"
                    fontClass="font-heading"
                />
                <FontFamilyCard
                    title="內文字體 (Body)"
                    fontName="思源黑體 (Source Han Sans)"
                    fontClass="font-body"
                />
            </div>
        );
    }

    if (category === "type_scale") {
        return (
            <div className="bg-white border border-brand-taupe/20 rounded-xl p-8 shadow-sm">
                <TypeScaleRow
                    label="H1"
                    desktopSize="48px"
                    mobileSize="32px"
                    weight="Bold (700)"
                    usage="頁面主要大標題"
                    cssClass="text-3xl lg:text-5xl font-bold font-heading"
                    tag="h1"
                />
                <TypeScaleRow
                    label="H2"
                    desktopSize="32px"
                    mobileSize="24px"
                    weight="Medium (500)"
                    usage="章節主要標題"
                    cssClass="text-2xl lg:text-3xl font-bold font-heading"
                    tag="h2"
                />
                <TypeScaleRow
                    label="H3"
                    desktopSize="24px"
                    mobileSize="20px"
                    weight="Medium (500)"
                    usage="卡片或小節標題"
                    cssClass="text-xl lg:text-2xl font-bold font-heading"
                    tag="h3"
                />
                <TypeScaleRow
                    label="Body"
                    desktopSize="18px"
                    mobileSize="16px"
                    weight="Regular (400)"
                    usage="主要段落文字"
                    cssClass="text-base lg:text-lg font-body"
                    tag="p"
                />
                <TypeScaleRow
                    label="Small"
                    desktopSize="14px"
                    mobileSize="14px"
                    weight="Regular (400)"
                    usage="註解、頁腳微小文字"
                    cssClass="text-sm font-body"
                    tag="small"
                />
            </div>
        );
    }

    return null;
}
