import React from "react";
import Container from "./container";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import ReactMarkdown from "react-markdown";

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
                  <Disclosure.Button className="flex items-center justify-between w-full px-4 py-4 text-lg text-left text-gray-800 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-100 focus-visible:ring-opacity-75 dark:bg-trueGray-800 dark:text-gray-200">
                    <span>{item.question}</span>
                    <ChevronUpIcon
                      className={`${open ? "transform rotate-180" : ""
                        } w-5 h-5 text-indigo-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-gray-500 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        // 自定义链接样式
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        // 自定义段落样式
                        p: ({ node, ...props }) => (
                          <p {...props} className="mb-3 last:mb-0" />
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
