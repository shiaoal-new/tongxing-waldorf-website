import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const CurriculumBlock = ({ data }) => {
    const [activeYear, setActiveYear] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const detailData = {
        // ... (data remains the same)
        'G1': {
            title: '一年級 發展圖像 (發展任務：合一)',
            content: '在第一個七年，孩子學習熟悉身體、發展空間的方向感和養成身體直立、說話和思考的基本發展能力。孩子所處的環境狀態就是他的學習情境。模仿的作用足以把他所學的銘印在孩子的意志中。\n\n在第七年左右，孩子進入最堅硬的部分－－換牙階段。他們在生長發育上已具足了足夠的生命力，轉而向外在世界開展。在一年級，授課重點不在多，而是透過遊戲、肢體活動、模仿，給孩子較寬闊、與其現階段生命相呼應的醒知；同時養成良好的班級生活習慣。'
        },
        'G2': {
            title: '二年級 發展圖像 (發展任務：二元)',
            content: '八歲的孩子展現更大的警覺，整體的心境分化成一些顯著的對立。例如：對宗教元素有較深入的感覺，但卻伴隨著對淘氣的吸引力。這年級讓孩子培養對呼吸的感覺，感受語言情感的豐富性。\n\n圖像思考仍居於重要地位，會移動、有生命之類的概念最適合孩子認識。經由大肢體與精細小動作，繼續熟稔語文與數學。恆齒繼續長高，側面的臼齒被堅固安置。'
        },
        'G3': {
            title: '三年級 發展圖像 (發展任務：入世)',
            content: '這時期被稱為「第九年門檻」。孩子生理與認知產生顯著改變：發音更直接清晰、呼吸與脈搏比值確立為 1:4。心靈上經歷主客觀的二元對立，問題、懷疑、孤獨和批評傾向萌芽。自我醒覺在此年發生，孩子經驗到從與世界統整中分離出來的失落感。古老故事的創世圖像與農耕、建築主課程，能撫慰孩子內在的安全感，幫助他們與環境建立新關係。'
        },
        'G4': {
            title: '四年級 發展圖像 (發展任務：分裂)',
            content: '孩子進入「童年的心臟」，內在自我動力連結了呼吸與血液循環的和諧，充滿活力。此時正值生命第二個七年的中間點，他們已準備好接受挑戰。課程引導他們進入「工作、工作，做很多工作」的座右銘。\n\n學習上開啟了自然科學的研究：從外觀型態觀察動物王國與在地環境。故事增加了複雜的人性矛盾（如西遊記、北歐神話），讓孩子從中建立對社會與地理環境的感覺。'
        },
        'G5': {
            title: '五年級 發展圖像 (發展任務：和諧)',
            content: '五年級是「心花盛開」的時期。孩子發展出「我」與「世界」的不同，對自我的醒覺強化，開始社會化。認知上能以真實合理的態度了解問題，掌握個人責任的基本概念。音樂與運動能力也顯著精通。這是一個智識與道德能力相對穩定的黃金時期，但在五年級結束後，孩子會再次經歷和諧的喪失。'
        },
        'G6': {
            title: '六年級 發展圖像 (發展任務：規矩)',
            content: '前青春期特徵出現，骨架增長、四肢變長，動作顯得笨拙。生理變化伴隨著思想因果關係的浮現。心理上進入「被調包的醜嬰孩」時期，面對童年逝去的劇痛。內在意識從希臘時代進入「羅馬時代」，需要強而有力的法律與秩序感。教師必須擁有如羅馬君主般的權威，將孩子的批判能力導向對自然世界的科學觀察。'
        },
        'G7': {
            title: '七年級 發展圖像 (發展任務：探索)',
            content: '13歲成為所謂的青少年，具備兩股力量：對現象知識的渴求與初萌的自我反思能力。身體成長快於心理，帶來性別認同壓力與焦慮。課程焦點在於對外在世界的探索與內在旅程。教師鼓勵孩子做出判斷，引導他們負起社會責任，體驗成為世界公民的責任。'
        },
        'G8': {
            title: '八年級 發展圖像 (發展任務：革命)',
            content: '14歲的孩子進入個體化階段，反覆檢查甚至挑戰既有規定。陪伴孩子經歷情感的誕生與解放是巨大的挑戰。孩子可以思考過去與感知未來，並進入自己的節奏。此年級的階段任務是「個人專題報告」，要求孩子選擇一個主題並獨立長時間工作，整合過去所學並當眾發表，將經驗轉化為原創思考。'
        },
        'G9': {
            title: '九年級 發展圖像 (發展任務：兩極)',
            content: '九年級以激烈方式追求獨立，遠離熟悉的舒適圈。邏輯與思考能力急速覺醒，使自我必須與他人保持距離。他們熱切尋求知性與慾望間的平衡。學科難度加深，安排專業教師深入教學，並帶領孩子增加與社會互動，進行公益服務。目標是讓孩子找到生命的熱情與天命，肯定與尊重自己。'
        }
    };

    const curriculumData = [
        { year: 'G1', state: '情感中的意志', task: '合一', objective: '建立生活節奏，養成良好習慣。', history: '童話', math: '1到12加減乘除', nature: '自然故事' },
        { year: 'G2', state: '情感中的意志', task: '二元', objective: '感受語言情感豐富性。', history: '寓言，聖者故事', math: '12乘法表', nature: '溪流歷險記' },
        { year: 'G3', state: '情感中的意志', task: '入世', objective: '跨越九歲門檻，建立安全感。', history: '創世紀', math: '測量與貨幣', nature: '農耕、建築' },
        { year: 'G4', state: '情感中的情感', task: '分裂', objective: '進入「童年的心臟」。', history: '北歐神話、西遊記', math: '分數', nature: '人與動物' },
        { year: 'G5', state: '情感中的情感', task: '和諧', objective: '理解是非與責任。', history: '古文明、希臘史', math: '小數、徒手幾何', nature: '植物' },
        { year: 'G6', state: '情感中的情感', task: '規矩', objective: '建立因果關係。', history: '羅馬史、法律', math: '尺規幾何', nature: '聲光熱、天文' },
        { year: 'G7', state: '情感中的思考', task: '探索', objective: '探索世界公民責任。', history: '文藝復興', math: '負數與代數', nature: '生理學、機械' },
        { year: 'G8', state: '情感中的思考', task: '革命', objective: '整合所學發表專題。', history: '近代史', math: '立體幾何', nature: '流體力學、營養' },
        { year: 'G9', state: '情感中的思考', task: '兩極', objective: '追求獨立與生命熱情。', history: '當代史、公益服務', math: '排組機統', nature: '有機化學、感官生理' },
    ];

    const showDetail = (year) => {
        setActiveYear(year);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setActiveYear(null);
        document.body.style.overflow = 'auto';
    };

    // Modal portal content
    const modalContent = (
        <AnimatePresence>
            {activeYear && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 touch-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-neutral-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative p-6 md:p-10">
                            <button
                                onClick={closeModal}
                                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors text-2xl"
                            >
                                &times;
                            </button>

                            <div className="border-l-8 border-warning-500 pl-6 mb-8">
                                <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-white leading-tight">
                                    {detailData[activeYear]?.title}
                                </h3>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                                <div className="text-lg md:text-xl leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                    {detailData[activeYear]?.content}
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-700 flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 dark:shadow-none hover:bg-primary-700 active:scale-95 transition-all"
                                >
                                    關閉解析
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">給孩子一份受用一生的禮物</h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">在快速變動的時代，同心華德福陪伴孩子透過「意志、情感、思考」的平衡發展，找回內在的自由與生命的力量。</p>
            </div>

            {/* 核心願景 */}
            <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-2xl mb-16 border-t-8 border-primary-600 shadow-sm">
                <h3 className="text-2xl font-bold text-primary-700 text-center mb-8">核心教育目標：三元力量的平衡</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-neutral-700 p-6 rounded-xl shadow-sm">
                        <h4 className="text-xl font-bold text-primary-600 border-b-2 border-neutral-100 dark:border-neutral-600 pb-3 mb-4">意志 (Will) - 手的做為</h4>
                        <p className="text-neutral-600 dark:text-neutral-300">透過真實勞動與實作，培養孩子「即知即行」的底氣與堅毅行動力。</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-700 p-6 rounded-xl shadow-sm">
                        <h4 className="text-xl font-bold text-primary-600 border-b-2 border-neutral-100 dark:border-neutral-600 pb-3 mb-4">情感 (Feeling) - 心的感受</h4>
                        <p className="text-neutral-600 dark:text-neutral-300">在藝術與節律中，滋養對萬物的崇敬，建立內外平衡與感知的敏銳度。</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-700 p-6 rounded-xl shadow-sm">
                        <h4 className="text-xl font-bold text-primary-600 border-b-2 border-neutral-100 dark:border-neutral-600 pb-3 mb-4">思考 (Thinking) - 頭的清晰</h4>
                        <p className="text-neutral-600 dark:text-neutral-300">從經驗轉化為抽象思考，培養洞察本質的生命智慧與獨立判斷力。</p>
                    </div>
                </div>
            </div>


            <h3 className="text-2xl font-bold text-primary-700 border-l-8 border-warning-500 pl-4 mb-8">1-9 年級課程脈絡與發展任務</h3>

            {/* 1-9 年級脈絡表 - 桌面版 */}
            <div className="hidden lg:block overflow-hidden bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-primary-600 text-white">
                            <th className="p-4 whitespace-nowrap">年段</th>
                            <th className="p-4 whitespace-nowrap">發展狀態</th>
                            <th className="p-4 whitespace-nowrap">發展任務</th>
                            <th className="p-4 whitespace-nowrap">年段目標</th>
                            <th className="p-4 whitespace-nowrap">文史</th>
                            <th className="p-4 whitespace-nowrap">數學</th>
                            <th className="p-4 whitespace-nowrap">自然</th>
                            <th className="p-4"> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {curriculumData.map((row, idx) => (
                            <tr key={idx} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                <td className="p-4 font-bold text-primary-700 bg-primary-50 dark:bg-primary-900/20 text-center">{row.year}</td>
                                <td className="p-4 text-warning-700 dark:text-warning-500 font-medium text-sm">{row.state}</td>
                                <td className="p-4 font-bold whitespace-nowrap text-neutral-800 dark:text-neutral-200">{row.task}</td>
                                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300">{row.objective}</td>
                                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300">{row.history}</td>
                                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300">{row.math}</td>
                                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300">{row.nature}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => showDetail(row.year)}
                                        className="px-3 py-1.5 border border-primary-600 text-primary-600 rounded-md text-xs font-bold hover:bg-primary-600 hover:text-white transition-all whitespace-nowrap"
                                    >
                                        深度解析
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 1-9 年級脈絡表 - 行動版 (Card Layout) */}
            <div className="lg:hidden space-y-6">
                {curriculumData.map((row, idx) => (
                    <div key={idx} className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border-t-4 border-primary-600 overflow-hidden">
                        <div className="bg-primary-50 dark:bg-primary-900/40 p-4 flex justify-between items-center border-b border-neutral-100 dark:border-neutral-700">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-primary-700">{row.year}</span>
                                <span className="bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-500 text-xs px-2 py-1 rounded font-bold">{row.state}</span>
                            </div>
                            <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">任務：{row.task}</span>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">年段目標</label>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{row.objective}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">文史</label>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{row.history}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">數學</label>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{row.math}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">自然</label>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{row.nature}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => showDetail(row.year)}
                                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-md shadow-primary-200 dark:shadow-none hover:bg-primary-700 active:scale-95 transition-all mt-4"
                            >
                                查看詳細年段解析
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Render Modal via Portal */}
            {mounted && createPortal(modalContent, document.body)}
        </div>
    );
};

export default CurriculumBlock;
