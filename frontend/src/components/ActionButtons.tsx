import React from "react";
import Button from "./Button";

export interface ButtonConfig {
    text: string;
    link?: string;
    onClick?: () => void;
    style?: string;
    size?: string;
}

interface ActionButtonsProps {
    buttons?: ButtonConfig[];
    align?: 'left' | 'center' | 'right';
    className?: string;
    size?: string;
}

export default function ActionButtons({ buttons, align = "center", className = "", size = "lg" }: ActionButtonsProps) {
    if (!buttons || buttons.length === 0) return null;

    const justifyContent = align === "left" ? "justify-start" : "justify-center";

    return (
        <div className={`flex flex-wrap gap-4 ${justifyContent} ${className}`}>
            {buttons.map((btn, idx) => {
                const target = btn.link?.startsWith("http") ? "_blank" : "_self";
                return (
                    <Button
                        key={idx}
                        href={btn.onClick ? undefined : btn.link}
                        onClick={btn.onClick}
                        target={target}
                        rel={target === "_blank" ? "noopener noreferrer" : undefined}
                        className={`${btn.style || "btn-primary"}`}
                        size={btn.size || size}
                    >
                        {btn.text}
                    </Button>
                );
            })}
        </div>
    );
}
