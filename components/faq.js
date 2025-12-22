import React from "react";
import Container from "./container";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Faq({ faqList }) {
  // 如果没有数据,返回 null
  if (!faqList || faqList.length === 0) {
    return null;
  }

  return (
    <Container className="!p-0">
      <div className="w-full max-w-2xl p-2 mx-auto rounded-2xl">
        {faqList.map((item, index) => (
          <div key={item.id || index} className="mb-5">
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex items-center justify-between w-full px-4 py-4 text-lg text-left text-brand-text rounded-lg bg-brand-bg hover:bg-brand-bg focus:outline-none focus-visible:ring focus-visible:ring-primary-100 focus-visible:ring-opacity-75 dark:bg-trueGray-800 dark:text-brand-bg">
                    <span>{item.question}</span>
                    <ChevronUpIcon
                      className={`${open ? "transform rotate-180" : ""
                        } w-5 h-5 text-brand-accent`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-brand-taupe dark:text-brand-taupe prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // 自定义链接样式
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-brand-accent hover:text-primary-800 dark:text-brand-accent dark:hover:text-brand-accent/60 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        // 自定义段落样式
                        p: ({ node, ...props }) => (
                          <p {...props} className="mb-3 last:mb-0" />
                        ),
                        // 自定義表格樣式
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
                      {item.answer}
                    </ReactMarkdown>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        ))}
      </div>
    </Container>
  );
}
