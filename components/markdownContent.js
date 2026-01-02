import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * 統一的 Markdown 渲染組件，包含自定義樣式（如表格、鏈接等）
 */
const MarkdownContent = ({ content, className = "" }) => {
    return (
        <div className={`prose prose-brand dark:prose-invert max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ node, ...props }) => (
                        <a
                            {...props}
                            className="text-brand-accent hover:text-primary-800 dark:text-brand-accent dark:hover:text-brand-accent/60 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    ),
                    p: ({ node, ...props }) => (
                        <p {...props} className="mb-3 last:mb-0" />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4">
                            <table {...props} className="min-w-full divide-y divide-brand-taupe/20 dark:divide-gray-700 border border-brand-taupe/20 dark:border-brand-structural" />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead {...props} className="bg-brand-bg dark:bg-brand-structural" />
                    ),
                    th: ({ node, ...props }) => (
                        <th {...props} className="px-6 py-3 text-left text-xs font-medium text-brand-taupe dark:text-brand-taupe uppercase tracking-wider border-b border-brand-taupe/20 dark:border-brand-structural" />
                    ),
                    td: ({ node, ...props }) => (
                        <td {...props} className="px-6 py-4 whitespace-normal text-sm text-brand-taupe dark:text-brand-taupe border-b border-brand-taupe/20 dark:border-brand-structural" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownContent;
