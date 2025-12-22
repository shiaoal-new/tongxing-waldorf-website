import React, { useState } from "react";
import Disclosure from "./disclosure";
import Container from "./container";

export default function AccordionList({ items }) {
    const [activeIndex, setActiveIndex] = useState(null);

    // 如果没有数据,返回 null
    if (!items || items.length === 0) {
        return null;
    }

    const toggleItem = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <Container className="!p-0">
            <div className="w-full max-w-2xl p-2 mx-auto rounded-2xl">
                {items.map((item, index) => (
                    <Disclosure
                        key={index}
                        title={item.title}
                        isOpen={activeIndex === index}
                        onToggle={() => toggleItem(index)}
                    >
                        {item.subtitle && (
                            <div className="text-sm font-bold text-brand-accent mb-2">
                                {item.subtitle}
                            </div>
                        )}
                        <div className="text-brand-taupe dark:text-brand-taupe">
                            {item.desc}
                        </div>
                    </Disclosure>
                ))}
            </div>
        </Container>
    );
}
