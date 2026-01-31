import React, { useState, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Modal from "../ui/Modal";
import MuseumLabel from "../ui/MuseumLabel";
import DevComment from "../ui/DevComment";
import { CurriculumBlock as CurriculumBlockType } from "../../types/content";

interface DetailData {
    title: string;
    content: string;
}

const detailData: Record<string, DetailData> = {
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
        content: '六年級的孩子開始「轉大人」——手腳變長、動作變笨拙，整個人看起來有點尷尬。心理上也開始面對「童年要結束了」的失落感。\n\n這時候他們需要「規矩」和「秩序\"來穩住自己。所以我們會教羅馬史、法律，讓他們理解「因果關係」。老師也要夠有權威，才能hold住這群開始叛逆的孩子。'
    },
    'G7': {
        title: '七年級 發展圖像 (發展任務：探索)',
        content: '十三歲，正式進入青春期。身體長得比心理快，所以會有點焦慮、有點不知所措。但同時他們也開始對世界充滿好奇，想要探索、想要理解。\n\n我們會鼓勵他們做判斷、負責任，開始思考「我是誰」「我跟這個世界的關係是什麼」。這是個往外探索、也往內探索的階段。'
    },
    'G8': {
        title: '八年級 發展圖像 (發展任務：革命)',
        content: '十四歲的孩子開始「革命\"——挑戰規定、質疑權威。這很正常，因為他們正在找自己。\n\n八年級的重頭戲是「個人專題」：選一個自己有興趣的主題，花幾個月研究，最後上台發表。這個過程會讓他們學到：我可以獨立完成一件事、我有能力把想法變成作品。這種成就感，會陪他們一輩子。'
    },
    'G9': {
        title: '九年級 發展圖像 (發展任務：兩極)',
        content: '九年級的孩子急著長大、急著獨立。他們的邏輯思考能力突飛猛進，但情感上還在拉扯。\n\n我們會加深學科難度，也會帶他們去做公益服務——走出校園，去真實世界裡碰撞。目標是讓他們找到「我想做什麼」「我的熱情在哪裡」，然後帶著這份確定感，走向下一個階段。'
    }
};

interface CurriculumRow {
    year: string;
    state: string;
    task: string;
    objective: string;
    history: string;
    math: string;
    nature: string;
}

const curriculumData: CurriculumRow[] = [
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

interface CurriculumBlockProps {
    data: CurriculumBlockType;
}

const CurriculumBlock = ({ data }: CurriculumBlockProps) => {
    const [activeYear, setActiveYear] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const showDetail = (year: string) => {
        setActiveYear(year);
    };

    const closeModal = () => {
        setActiveYear(null);
    };

    const getGradeColor = (year: string) => {
        const colors: Record<string, string> = {
            'G1': 'bg-rose-100 text-rose-700 border-rose-200',
            'G2': 'bg-orange-100 text-orange-700 border-orange-200',
            'G3': 'bg-amber-100 text-amber-700 border-amber-200',
            'G4': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'G5': 'bg-teal-100 text-teal-700 border-teal-200',
            'G6': 'bg-sky-100 text-sky-700 border-sky-200',
            'G7': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'G8': 'bg-violet-100 text-violet-700 border-violet-200',
            'G9': 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return colors[year] || 'bg-brand-accent/10 text-brand-accent border-brand-accent/20';
    };

    return (
        <div className="w-full" ref={containerRef}>
            <h3 className="text-brand-accent border-l-8 border-brand-accent/30 pl-4 mb-component">1-9 年級課程脈絡與發展任務</h3>

            <DevComment text="Curriculum Block Growth Path View" />

            {/* 1-9 年級成長小徑 - 桌面版 */}
            <div className="hidden lg:block relative py-20 px-10">
                {/* 裝飾性背景元素 */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-10 right-[-5%] w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-40 left-[-5%] w-80 h-80 bg-brand-taupe/5 rounded-full blur-3xl" />
                </div>

                {/* SVG 成長路徑 */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-0">
                    <svg width="400" height="100%" viewBox="0 0 400 1600" preserveAspectRatio="none" className="h-full overflow-visible">
                        {/* 底色路徑 */}
                        <path
                            d="M 200 0 Q 350 200 200 400 T 200 800 T 200 1200 T 200 1600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-brand-taupe/10"
                        />
                        {/* 動態生長路徑 */}
                        <motion.path
                            d="M 200 0 Q 350 200 200 400 T 200 800 T 200 1200 T 200 1600"
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            style={{ pathLength }}
                        />
                        <defs>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--color-brand-accent)" stopOpacity="0.3" />
                                <stop offset="50%" stopColor="var(--color-brand-accent)" />
                                <stop offset="100%" stopColor="var(--color-brand-accent)" stopOpacity="0.6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* 年級節點與卡片 */}
                <div className="relative z-10 space-y-32">
                    {curriculumData.map((row, idx) => {
                        const isEven = idx % 2 === 0;
                        return (
                            <div key={idx} className={`flex items-center gap-12 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                                {/* 卡片區 */}
                                <motion.div
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, type: "spring" }}
                                    className="flex-1"
                                >
                                    <div className="bg-brand-bg/80 dark:bg-brand-structural/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-brand-taupe/10 hover:shadow-2xl transition-all group overflow-hidden relative">
                                        {/* 背景裝飾 */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 group-hover:scale-110 transition-transform ${getGradeColor(row.year).split(' ')[0]}`} />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 border ${getGradeColor(row.year)}`}>
                                                        {row.state}
                                                    </span>
                                                    <h4 className="text-xl font-black text-brand-text dark:text-brand-bg flex items-center gap-2">
                                                        發展任務：{row.task}
                                                    </h4>
                                                </div>
                                                <span className="text-4xl font-black opacity-10 group-hover:opacity-20 transition-opacity">
                                                    {row.year}
                                                </span>
                                            </div>

                                            <p className="text-brand-text/70 dark:text-brand-bg/70 text-sm mb-6 leading-relaxed">
                                                {row.objective}
                                            </p>

                                            <div className="grid grid-cols-3 gap-4 border-t border-brand-taupe/5 pt-4 text-xs">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-brand-accent">文史</div>
                                                    <div className="opacity-80">{row.history}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-bold text-brand-accent">數學</div>
                                                    <div className="opacity-80">{row.math}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-bold text-brand-accent">自然</div>
                                                    <div className="opacity-80">{row.nature}</div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => showDetail(row.year)}
                                                className="mt-6 w-full py-2 rounded-lg border border-brand-accent/20 hover:bg-brand-accent hover:text-brand-bg transition-colors text-sm font-bold tracking-wider"
                                            >
                                                探索圖像
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 中央節點 */}
                                <div className="relative flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        className={`w-12 h-12 rounded-full border-4 border-brand-bg dark:border-brand-structural bg-brand-accent shadow-lg z-20 flex items-center justify-center text-brand-bg font-black`}
                                    >
                                        {row.year.replace('G', '')}
                                    </motion.div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-brand-accent/10 rounded-full animate-pulse z-10" />
                                </div>

                                {/* 空白區（平衡佈局） */}
                                <div className="flex-1" />
                            </div>
                        );
                    })}
                </div>
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
                title=""
                padding="p-0"
                maxWidth="max-w-md"
            >
                {activeYear && detailData[activeYear] && (
                    <MuseumLabel
                        title={detailData[activeYear].title.split(' ')[0]} // e.g. "一年級"
                        metadata={
                            <span className="text-warning-600 font-bold tracking-wider">
                                {detailData[activeYear].title.split(' ').slice(1).join(' ')}
                            </span>
                        }
                        footerItems={[
                            { label: "Year Level", value: activeYear },
                            { label: "Category", value: "Development Task" }
                        ]}
                    >
                        <div className="text-lg leading-loose text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                            {detailData[activeYear].content}
                        </div>
                    </MuseumLabel>
                )}
            </Modal>
        </div>
    );
};

export default CurriculumBlock;
