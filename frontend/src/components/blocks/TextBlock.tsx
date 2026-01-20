import ActionButtons from "../ui/ActionButtons";
import ExpandableText from "../ui/ExpandableText";
import { TextBlock as TextBlockType } from "../../types/content";

interface TextBlockProps {
    data: TextBlockType;
    align?: string;
    isNested?: boolean;
}

/**
 * TextBlock Component
 * 提取的 UI 組件:文字區塊
 */
export default function TextBlock({ data, align, isNested }: TextBlockProps) {
    return (
        <div className={`${isNested ? '' : 'section-container'} ${align === 'left' ? 'text-left' : 'text-center'}`}>
            {data.subtitle && (
                <div className="label-accent">
                    {data.subtitle}
                </div>
            )}
            {data.title && !isNested && (
                <h3 className="mt-3 text-brand-text dark:text-brand-bg">
                    {data.title}
                </h3>
            )}
            {data.content && (
                <div className={`py-2 ${isNested ? 'text-base' : 'text-lg'} text-brand-taupe dark:text-brand-taupe`}>
                    <ExpandableText
                        content={data.content}
                        collapsedHeight={isNested ? 80 : 120}
                        disableExpand={isNested || false}
                    />
                </div>
            )}
            {!isNested && <ActionButtons buttons={data.buttons} align={align === "left" ? "left" : "center"} className="mt-6" />}
        </div>
    );
}
