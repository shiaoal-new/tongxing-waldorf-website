import React from "react";
import Container from "../ui/Container";
import {
    ClipboardCheckIcon,
    OfficeBuildingIcon,
    ChatAlt2Icon,
    CheckCircleIcon
} from "@heroicons/react/outline";

interface Step {
    title: string;
    desc: string;
    icon: React.ReactNode;
}

const steps: Step[] = [
    {
        title: "線上預約",
        desc: "於下方場次列表中選擇合適的日期並填寫報名資料。",
        icon: <ClipboardCheckIcon />,
    },
    {
        title: "參觀學校",
        desc: "依約定時間蒞臨學校，由專人導覽解說校園與課程。",
        icon: <OfficeBuildingIcon />,
    },
    {
        title: "雙向交流",
        desc: "參觀後進行座談，解答您對華德福教育的所有疑問。",
        icon: <ChatAlt2Icon />,
    },
    {
        title: "入學申請",
        desc: "若認同我們的教育理念，歡迎索取入學申請表格。",
        icon: <CheckCircleIcon />,
    },
];

export default function VisitProcess() {
    return (
        <Container>
            <div className="grid spacing-component lg:grid-cols-2 xl:grid-cols-4">
                {steps.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-top text-center bg-brand-bg dark:bg-brand-structural/20 p-component rounded-xl border border-brand-taupe/5">
                        <div className="flex items-center justify-center w-16 h-16 p-4 mb-component rounded-full bg-brand-accent/10 text-brand-accent dark:bg-brand-accent/20">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-brand-text dark:text-brand-bg leading-brand tracking-brand">{item.title}</h3>
                        <p className="mt-component text-brand-taupe dark:text-brand-taupe leading-brand">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </Container>
    );
}
