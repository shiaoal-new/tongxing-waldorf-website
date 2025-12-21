import React from "react";
import Button from "./button";

export default function ActionButtons({ buttons, align = "center", className = "" }) {
    if (!buttons || buttons.length === 0) return null;

    const justifyContent = align === "left" ? "justify-start" : "justify-center";

    return (
        <div className={`flex flex-wrap gap-4 ${justifyContent} ${className}`}>
            {buttons.map((btn, idx) => {
                const target = btn.link?.startsWith("http") ? "_blank" : "_self";
                return (
                    <Button
                        key={idx}
                        href={btn.link}
                        target={target}
                        rel={target === "_blank" ? "noopener noreferrer" : undefined}
                        className={`${btn.style || "btn-primary"}`}
                    >
                        {btn.text}
                    </Button>
                );
            })}
        </div>
    );
}
