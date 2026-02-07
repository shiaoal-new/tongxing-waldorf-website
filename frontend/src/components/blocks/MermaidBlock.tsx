import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { MermaidBlock as MermaidBlockType } from '../../types/content';

// 初始化 mermaid
if (typeof window !== 'undefined') {
    mermaid.initialize({
        startOnLoad: false, // 改為 false 由組件手動渲染
        theme: 'base',
        themeVariables: {
            // 基礎色調
            primaryColor: '#4e342e', // 深咖啡色
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#4e342e',
            lineColor: '#6d4c41',
            secondaryColor: '#8d6e63',
            tertiaryColor: '#bcaaa4',

            // 心智圖專用色值 (確保每一層文字都清晰)
            nodeTextColor: '#ffffff',
            mainBkg: '#3e2723',
            textColor: '#ffffff',

            // 針對心智圖不同的層級 (Sections) 強制設定背景與文字色
            sectionBkgColor: '#4e342e',
            sectionTextColor: '#ffffff',

            // 甚至強制設定 1-4 層的顏色以防萬一
            cScale0: '#3e2723',
            cScaleInv0: '#ffffff',
            cScale1: '#5d4037',
            cScaleInv1: '#ffffff',
            cScale2: '#795548',
            cScaleInv2: '#ffffff',
            cScale3: '#8d6e63',
            cScaleInv3: '#ffffff',

            fontFamily: '"Noto Sans TC", sans-serif',
            fontSize: '18px', // 增大字體
        },
        securityLevel: 'loose',
    });
}

interface MermaidBlockProps {
    data: MermaidBlockType;
}

const MERMAID_KEYWORDS = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
    'erDiagram', 'journey', 'gantt', 'pie', 'quadrantChart', 'requirementDiagram',
    'mindmap', 'timeline', 'gitGraph', 'C4Context'
];

const MermaidBlock: React.FC<MermaidBlockProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        const renderChart = async () => {
            if (!containerRef.current || !data.chart) return;

            // 檢查是否為有效的 Mermaid 語法 (防止未解析的 wording key 導致崩潰)
            const trimmedChart = data.chart.trim();
            const firstWord = trimmedChart.split(/\s+/)[0];

            if (!MERMAID_KEYWORDS.includes(firstWord)) {
                console.log('Skipping Mermaid render: not a valid diagram type yet', firstWord);
                containerRef.current.innerHTML = '<div class="flex justify-center p-10"><div class="animate-pulse text-brand-taupe/20 text-4xl">...</div></div>';
                return;
            }

            try {
                // 清除之前內容並顯示載入中
                containerRef.current.innerHTML = '<div class="flex justify-center p-10"><div class="animate-pulse text-brand-taupe/20 text-4xl">...</div></div>';

                const { svg } = await mermaid.render(chartId.current, trimmedChart);
                containerRef.current.innerHTML = svg;

                // 修正 SVG 寬度以適應容器
                const svgElement = containerRef.current.querySelector('svg');
                if (svgElement) {
                    svgElement.style.height = 'auto';

                    // 在桌面端使用 maxWidth 控制，在行動端允許溢出捲動
                    if (window.innerWidth < 640) {
                        svgElement.style.minWidth = '600px'; // 確保心智圖不會縮得太小
                        svgElement.style.maxWidth = 'none';
                    } else {
                        svgElement.style.maxWidth = '100%';
                        svgElement.style.minWidth = 'auto';
                    }
                }
            } catch (error) {
                console.error('Mermaid render failed:', error);
                containerRef.current.innerHTML = `<pre class="text-xs text-red-500 overflow-auto p-4 bg-red-50 rounded">${data.chart}</pre>`;
            }
        };

        renderChart();
    }, [data.chart]);

    return (
        <div className="mermaid-container my-12 flex flex-col items-center w-full px-0 sm:px-4 overflow-hidden relative group">
            {/* 行動端捲動提示 */}
            <div className="sm:hidden flex items-center gap-1 mb-2 text-[10px] text-brand-taupe/60 uppercase tracking-widest font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                左右滑動檢視完整圖表
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .mermaid-container .nodeText, 
                .mermaid-container .mindmap-node text,
                .mermaid-container .section-text,
                .mermaid-container foreignObject div {
                    color: white !important;
                    fill: white !important;
                    font-weight: 600 !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
                }
                .mermaid-container .mindmap-node rect,
                .mermaid-container .mindmap-node circle,
                .mermaid-container .mindmap-node polygon,
                .mermaid-container .mindmap-node path {
                    stroke-width: 2px !important;
                }
            `}} />

            <div
                ref={containerRef}
                className="w-full overflow-x-auto overflow-y-hidden flex justify-start sm:justify-center bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-8 shadow-xl border border-brand-taupe/10 custom-scrollbar transition-all"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* SVG will be rendered here */}
            </div>
            {data.caption && (
                <p className="mt-4 text-sm text-brand-taupe italic font-medium px-4 text-center">
                    {data.caption}
                </p>
            )}
        </div>
    );
};

export default MermaidBlock;
