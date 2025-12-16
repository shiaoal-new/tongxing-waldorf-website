import Container from "./container";
import {
    ClipboardCheckIcon,
    OfficeBuildingIcon,
    ChatAlt2Icon,
    CheckCircleIcon
} from "@heroicons/react/outline";

const steps = [
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
            <div className="grid gap-10 lg:grid-cols-2 xl:grid-cols-4">
                {steps.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-top text-center bg-gray-50 dark:bg-trueGray-800 p-8 rounded-xl">
                        <div className="flex items-center justify-center w-16 h-16 p-4 mb-6 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.title}</h3>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </Container>
    );
}
