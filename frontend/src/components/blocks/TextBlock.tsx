import { TextBlock as TextBlockType } from "../../types/content";
import StaggeredReveal from "../ui/StaggeredReveal";

interface TextBlockProps {
    data: TextBlockType;
    align?: string;
    isNested?: boolean;
    disableExpand?: boolean;
}

/**
 * TextBlock Component
 * 提取的 UI 組件:文字區塊
 */
export default function TextBlock({ data, align, isNested, disableExpand }: TextBlockProps) {
    return (
        <div className={isNested ? '' : 'section-container'}>
            <StaggeredReveal
                subtitle={data.subtitle}
                title={data.title}
                content={data.content}
                buttons={data.buttons}
                align={(align as any) || 'center'}
                isNested={isNested}
                disableExpand={disableExpand}
            />
        </div>
    );
}
