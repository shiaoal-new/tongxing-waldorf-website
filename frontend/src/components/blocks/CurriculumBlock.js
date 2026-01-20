import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import Modal from "../ui/Modal";
import DevComment from "../ui/DevComment";


const CurriculumBlock = ({ data }) => {
    const [activeYear, setActiveYear] = useState(null);

    const detailData = {
        'G1': {
            title: '一年級 發展圖像 (發展任務：合一)',
            content: '七歲的孩子，身體正在長、牙齒開始換，整個人充滿生命力。這時候他們最需要的不是塞滿知識，而是透過玩、動、模仿，去感受這個世界。\n\n一年級的重點不在「學多少」，而是「養成好習慣」——好好生活、好好跟同學相處。孩子就像海綿，周圍的環境是什麼樣，他們就吸收什麼。所以我們會用遊戲、故事、肢體活動，讓他們在快樂中學習。'
        },
        'G2': {
            title: '二年級 發展圖像 (發展任務：二元)',
            content: '八歲的孩子開始變得「矛盾」——一下子很乖、一下子又很皮。這很正常，因為他們正在學習「世界不是非黑即白」。\n\n這個階段我們會用很多圖像、故事來教學，因為孩子還是用「畫面」在思考。透過大動作和小動作的練習，繼續熟悉語文和數學。牙齒也繼續長，身體越來越穩定。'
        },
        'G3': {
            title: '三年級 發展圖像 (發展任務：入世)',
            content: '九歲是個關鍵時刻，叫做「九歲門檻」。孩子開始意識到「我」跟「世界」是分開的——這聽起來很抽象，但你會發現他們突然變得愛問問題、愛懷疑、有時候還會覺得孤單。\n\n這時候我們會用創世故事、農耕、蓋房子這些主題，讓孩子感受到「人跟土地的連結」。這能幫助他們在這個有點失落的階段，重新找到安全感。'
        },
        'G4': {
            title: '四年級 發展圖像 (發展任務：分裂)',
            content: '四年級是「童年的心臟」——孩子充滿活力，準備好接受挑戰了！這時候我們會給他們很多「工作」：觀察動物、研究環境、聽複雜的故事（像西遊記、北歐神話）。\n\n這些故事裡有善惡、有矛盾、有人性的複雜面。孩子會從中學到：世界不簡單，但很有趣。'
        },
        'G5': {
            title: '五年級 發展圖像 (發展任務：和諧)',
            content: '五年級是「心花盛開」的黃金時期。孩子開始懂得「我」跟「別人」的界線，也開始理解什麼是責任。音樂、運動能力都變得很好，學習狀態也很穩定。\n\n這是個相對平靜美好的階段——但別太開心，因為六年級又會開始亂了（笑）。所以我們會好好珍惜這段時光，讓孩子盡情發展。'
        },
        'G6': {
            title: '六年級 發展圖像 (發展任務：規矩)',
            content: '六年級的孩子開始「轉大人」——手腳變長、動作變笨拙，整個人看起來有點尷尬。心理上也開始面對「童年要結束了」的失落感。\n\n這時候他們需要「規矩」和「秩序」來穩住自己。所以我們會教羅馬史、法律，讓他們理解「因果關係」。老師也要夠有權威，才能hold住這群開始叛逆的孩子。'
        },
        'G7': {
            title: '七年級 發展圖像 (發展任務：探索)',
            content: '十三歲，正式進入青春期。身體長得比心理快，所以會有點焦慮、有點不知所措。但同時他們也開始對世界充滿好奇，想要探索、想要理解。\n\n我們會鼓勵他們做判斷、負責任，開始思考「我是誰」「我跟這個世界的關係是什麼」。這是個往外探索、也往內探索的階段。'
        },
        'G8': {
            title: '八年級 發展圖像 (發展任務：革命)',
            content: '十四歲的孩子開始「革命」——挑戰規定、質疑權威。這很正常，因為他們正在找自己。\n\n八年級的重頭戲是「個人專題」：選一個自己有興趣的主題，花幾個月研究，最後上台發表。這個過程會讓他們學到：我可以獨立完成一件事、我有能力把想法變成作品。這種成就感，會陪他們一輩子。'
        },
        'G9': {
            title: '九年級 發展圖像 (發展任務：兩極)',
            content: '九年級的孩子急著長大、急著獨立。他們的邏輯思考能力突飛猛進，但情感上還在拉扯。\n\n我們會加深學科難度，也會帶他們去做公益服務——走出校園，去真實世界裡碰撞。目標是讓他們找到「我想做什麼」「我的熱情在哪裡」，然後帶著這份確定感，走向下一個階段。'
        }
    };

    const curriculumData = [
        { year: 'G1', state: '情感中的意志', task: '合一', objective: '建立生活節奏，養成良好習慣', history: '童話', math: '1到12加減乘除', nature: '自然故事' },
        { year: 'G2', state: '情感中的意志', task: '二元', objective: '感受語言的豐富與美', history: '寓言、聖者故事', math: '12乘法表', nature: '溪流歷險記' },
        { year: 'G3', state: '情感中的意志', task: '入世', objective: '跨越九歲門檻，重建安全感', history: '創世紀', math: '測量與貨幣', nature: '農耕、建築' },
        { year: 'G4', state: '情感中的情感', task: '分裂', objective: '進入童年的心臟，迎接挑戰', history: '北歐神話、西遊記', math: '分數', nature: '人與動物' },
        { year: 'G5', state: '情感中的情感', task: '和諧', objective: '理解責任，發展自我', history: '古文明、希臘史', math: '小數、徒手幾何', nature: '植物' },
        { year: 'G6', state: '情感中的情感', task: '規矩', objective: '建立因果關係與秩序感', history: '羅馬史、法律', math: '尺規幾何', nature: '聲光熱、天文' },
        { year: 'G7', state: '情感中的思考', task: '探索', objective: '探索世界，認識自我', history: '文藝復興', math: '負數與代數', nature: '生理學、機械' },
        { year: 'G8', state: '情感中的思考', task: '革命', objective: '整合所學，獨立完成專題', history: '近代史', math: '立體幾何', nature: '流體力學、營養' },
        { year: 'G9', state: '情感中的思考', task: '兩極', objective: '找到熱情，邁向獨立', history: '當代史、公益服務', math: '排組機統', nature: '有機化學、感官生理' },
    ];

    const showDetail = (year) => {
        setActiveYear(year);
    };

    const closeModal = () => {
        setActiveYear(null);
    };

    return (
        <div className="w-full">
            <h3 className="text-brand-accent border-l-8 border-brand-accent/30 pl-4 mb-component">1-9 年級課程脈絡與發展任務</h3>

            <DevComment text="Curriculum Block Desktop Table View" />
            {/* 1-9 年級脈絡表 - 桌面版 */}

            <div className="hidden lg:block overflow-hidden bg-brand-bg dark:bg-brand-structural/20 rounded-xl shadow-md border border-brand-taupe/10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-brand-accent text-brand-bg">
                            <th className="p-4 whitespace-nowrap leading-brand">年段</th>
                            <th className="p-4 whitespace-nowrap leading-brand">發展狀態</th>
                            <th className="p-4 whitespace-nowrap leading-brand">發展任務</th>
                            <th className="p-4 whitespace-nowrap leading-brand">年段目標</th>
                            <th className="p-4 whitespace-nowrap leading-brand">文史</th>
                            <th className="p-4 whitespace-nowrap leading-brand">數學</th>
                            <th className="p-4 whitespace-nowrap leading-brand">自然</th>
                            <th className="p-4"> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {curriculumData.map((row, idx) => (
                            <tr key={idx} className="border-b border-brand-taupe/10 dark:border-brand-structural/50 hover:bg-brand-accent/5 dark:hover:bg-brand-structural/40 transition-colors">
                                <td className="p-4 font-bold text-brand-accent bg-brand-accent/5 text-center">{row.year}</td>
                                <td className="p-4 text-brand-accent/80 font-bold text-sm leading-brand">{row.state}</td>
                                <td className="p-4 font-bold whitespace-nowrap text-brand-text dark:text-brand-bg leading-brand">{row.task}</td>
                                <td className="p-4 text-sm text-brand-text/80 dark:text-brand-bg/80 leading-brand">{row.objective}</td>
                                <td className="p-4 text-sm text-brand-text/80 dark:text-brand-bg/80 leading-brand">{row.history}</td>
                                <td className="p-4 text-sm text-brand-text/80 dark:text-brand-bg/80 leading-brand">{row.math}</td>
                                <td className="p-4 text-sm text-brand-text/80 dark:text-brand-bg/80 leading-brand">{row.nature}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => showDetail(row.year)}
                                        className="btn btn-outline-primary btn-xs whitespace-nowrap"
                                    >
                                        深度解析
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DevComment text="Curriculum Block Mobile Card View" />
            {/* 1-9 年級脈絡表 - 行動版 (Card Layout) */}

            <div className="lg:hidden space-y-component mt-component">
                {curriculumData.map((row, idx) => (
                    <div key={idx} className="bg-brand-bg dark:bg-brand-structural/20 rounded-2xl shadow-sm border border-brand-taupe/10 border-t-4 border-t-brand-accent overflow-hidden">
                        <div className="bg-brand-accent/5 dark:bg-brand-structural/40 p-component flex justify-between items-center border-b border-brand-taupe/10">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-brand-accent">{row.year}</span>
                                <span className="bg-brand-accent/10 text-brand-accent text-[10px] px-2 py-1 rounded font-bold uppercase tracking-brand">{row.state}</span>
                            </div>
                            <span className="text-sm font-bold text-brand-taupe">任務：{row.task}</span>
                        </div>
                        <div className="p-component space-y-component">
                            <div className="grid grid-cols-2 spacing-component">
                                <div>
                                    <label className="text-[10px] font-bold text-brand-accent uppercase tracking-brand block mb-1">年段目標</label>
                                    <p className="text-sm text-brand-text dark:text-brand-bg leading-brand">{row.objective}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-brand-accent uppercase tracking-brand block mb-1">文史</label>
                                    <p className="text-sm text-brand-text dark:text-brand-bg leading-brand">{row.history}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-brand-accent uppercase tracking-brand block mb-1">數學</label>
                                    <p className="text-sm text-brand-text dark:text-brand-bg leading-brand">{row.math}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-brand-accent uppercase tracking-brand block mb-1">自然</label>
                                    <p className="text-sm text-brand-text dark:text-brand-bg leading-brand">{row.nature}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => showDetail(row.year)}
                                className="btn btn-white btn-block"
                            >
                                詳細解析
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={!!activeYear}
                onClose={closeModal}
                title={detailData[activeYear]?.title}
            >
                <div className="text-lg md:text-xl leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                    {detailData[activeYear]?.content}
                </div>
                <div className="mt-10 pt-6 border-t border-brand-taupe/10 dark:border-brand-structural/50 flex justify-end">
                    <button
                        onClick={closeModal}
                        className="btn btn-primary px-8"
                    >
                        關閉解析
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default CurriculumBlock;
