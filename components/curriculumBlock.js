import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import Modal from "./modal";
import Container from "./container";

const CurriculumBlock = ({ data }) => {
    const [activeYear, setActiveYear] = useState(null);

    const detailData = {
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
    };

    const closeModal = () => {
        setActiveYear(null);
    };

    return (
        <Container className="w-full">
            <h3 className="text-2xl font-bold text-brand-accent border-l-8 border-brand-accent/30 pl-4 mb-component leading-brand tracking-brand">1-9 年級課程脈絡與發展任務</h3>

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
                                        className="px-3 py-1.5 border border-brand-accent text-brand-accent rounded-md text-xs font-bold hover:bg-brand-accent hover:text-brand-bg transition-all whitespace-nowrap"
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
                            <div className="grid grid-cols-2 gap-component">
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
                                className="w-full btn-white rounded-xl py-3 font-bold transition-all"
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
                        className="px-8 btn-primary rounded-2xl font-bold shadow-lg shadow-brand-accent/20 dark:shadow-none active:scale-95"
                    >
                        關閉解析
                    </button>
                </div>
            </Modal>
        </Container>
    );
};

export default CurriculumBlock;
