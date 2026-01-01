import React from "react";

export default function Logo() {
    return (
        <span className="inline-flex items-center justify-center rounded-lg bg-brand-text">
            <img
                src="/img/logo.svg"
                alt="N"
                width="28"
                height="28"
                className="w-7 h-7"
            />
        </span>
    );
}
