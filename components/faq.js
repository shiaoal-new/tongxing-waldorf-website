import React from "react";
import Container from "./container";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";

export default function Faq() {
  return (
    <Container className="!p-0">
      <div className="w-full max-w-2xl p-2 mx-auto rounded-2xl">
        {faqdata.map((item, index) => (
          <div key={item.question} className="mb-5">
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
                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-gray-500 dark:text-gray-300">
                    {item.answer}
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

const faqdata = [
  {
    question: "同心的學費",
    answer: "G1-G6（小學部）學費為每學期85000元。G7-G8（中學部）為每學期95000元。午餐費為每餐90元（將保留物價波動調整的彈性）。",
  },
  {
    question: "畢業生的發展",
    answer: "同心的畢業生都有學籍學校的畢業證書。同心也會給每個畢業生屬於同心華德福的畢業證書。從過去的經驗觀察到，華德福學校畢業後的孩子能夠獨當一面，自主自立，同時積極參與到社會裡頭。根據社會企業的需求面來看 受企業親睞的人才，人品佳、能獨力解決問題、能團隊合作是最核心的三項能力 以此來看，華德福學校的畢業生在各行各業都是充滿競爭力的。除此之外，華德福學校處處充滿身心靈和諧的行動。畢業生在耳濡目染之下，也能夠將善、美、真放在自己的生命核心中。帶著這個能量，華德福學校的畢業生無論在各行各業都能積極完成自我，綻放出獨特的樣貌。",
  },
  {
    question: "未來轉銜的可能性",
    answer:
      "華德福教育有對人完整的發展圖像，從幼兒園到高中。我們期待培育出健全、獨立、自主的人 體制內教育（十二年國教）目前也關注人的素養導向。期待完整的人是主動、能互動、能與社會共好 這一點，華德福教育與體制內教育是沒有衝突的。一百年來，華德福教育也一直扮演教育改革、社會改革的先鋒 同心截至108學年度，學校第七年辦學到九年級。我們同樣有從幼兒園到高中的辦學圖像 在還沒有高中部之前，九年級的畢業生也能夠依據對自己的瞭解。選擇參與各式升學管道（包括華德福高中、特色獨招等）",
  },
  {
    question: "Do you offer technical support? ",
    answer:
      "No, we don't offer technical support for free downloads. Please purchase a support plan to get 6 months of support.",
  },
];
