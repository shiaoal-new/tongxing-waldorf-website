import React from "react";

export default function ActionButtons({ buttons, align = "center", className = "" }) {
    if (!buttons || buttons.length === 0) return null;

    const justifyContent = align === "left" ? "justify-start" : "justify-center";

    return (
        <div className={`mt-8 flex flex-wrap gap-4 ${justifyContent} ${className}`}>
            {buttons.map((btn, idx) => {
                return (
                    <a
                        key={idx}
                        href={btn.link}
                        target={btn.link?.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`px-8 py-3 text-lg font-medium text-center rounded-md transition-all ${btn.style || "btn-primary"
                            }`}
                    >
                        {btn.text}
                    </a>
                );
            })}
        </div>
    );
}
