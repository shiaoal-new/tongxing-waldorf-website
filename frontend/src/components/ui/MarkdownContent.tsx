import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Tooltip from "./Tooltip";

interface MarkdownContentProps {
    content: string;
    className?: string;
    isInline?: boolean;
    tag?: React.ElementType;
}

/**
 * 統一的 Markdown 渲染組件，包含自定義樣式（如表格、鏈接等）
 * 支持工具提示語法：[文字](tooltip:提示內容) 或 [文字]{提示內容}
 */
const MarkdownContent = ({
    content,
    className = "",
    isInline = false,
    tag = "div"
}: MarkdownContentProps) => {
    // 預處理語法：將 [文字]{提示內容} 轉換為 [文字](tooltip:提示內容)
    const processedContent = content.replace(/\[([^\]]+)\]\{([^\}]+)\}/g, '[$1](tooltip:$2)');

    const Container = tag as any;

    return (
        <Container className={`${!isInline ? "prose prose-brand dark:prose-invert max-w-none" : ""} ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                urlTransform={(url) => url.startsWith('tooltip:') ? url : url}
                components={{
                    a: ({ node, ...props }) => {
                        const href = props.href || "";
                        if (href.startsWith("tooltip:")) {
                            const tooltipContent = decodeURIComponent(href.replace("tooltip:", ""));
                            return <Tooltip content={tooltipContent}>{props.children}</Tooltip>;
                        }
                        return (
                            <a
                                {...props}
                                className="text-brand-accent hover:text-primary-800 dark:text-brand-accent dark:hover:text-brand-accent/60 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        );
                    },
                    p: ({ ...props }) => isInline ? (
                        <span {...props} />
                    ) : (
                        <p {...props} className="mb-3 last:mb-0 text-justify" style={{ lineHeight: 'var(--typography-line-height)' }} />
                    ),
                    table: ({ ...props }) => (
                        <div className="overflow-x-auto my-4">
                            <table {...props} className="min-w-full divide-y divide-brand-taupe/20 dark:divide-gray-700 border border-brand-taupe/20 dark:border-brand-structural" />
                        </div>
                    ),
                    thead: ({ ...props }) => (
                        <thead {...props} className="bg-brand-bg dark:bg-brand-structural" />
                    ),
                    th: ({ ...props }) => (
                        <th {...props} className="px-6 py-3 text-left text-xs font-medium text-brand-taupe dark:text-brand-taupe uppercase tracking-wider border-b border-brand-taupe/20 dark:border-brand-structural" />
                    ),
                    td: ({ ...props }) => (
                        <td {...props} className="px-6 py-4 whitespace-normal text-sm text-brand-taupe dark:text-brand-taupe border-b border-brand-taupe/20 dark:border-brand-structural" />
                    ),
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </Container>
    );
};

export default MarkdownContent;
