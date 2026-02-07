import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { MermaidBlock as MermaidBlockType } from '../../types/content';

// 初始化 mermaid
if (typeof window !== 'undefined') {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral', // neutral 主題不會對 slice 加上飽和度或明度調整，顏色最準確
        themeVariables: {
            primaryColor: '#4e342e',
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

            // 圓餅圖專用多樣配色 (確保顏色區隔明顯)
            pie1: '#4e342e', // 深咖 (續讀)
            pie2: '#bf360c', // 深橘紅 (轉軌)
            pie3: '#2e7d32', // 森林綠 (技職)
            pie4: '#1565c0', // 靛藍 (出國)
            pie5: '#ff8f00', // 琥珀 (自學)
            pie6: '#6a1b9a', // 紫色
            pie7: '#00838f', // 青色
            pie8: '#ad1457', // 桃紅
            pie9: '#c62828', // 紅色
            pie10: '#283593', // 深藍
            pie11: '#37474f', // 藍灰
            pie12: '#558b2f', // 草綠

            // 多樣化的配色序列 (針對 Pie Chart, Mindmap)
            cScale0: '#3e2723',
            cScaleInv0: '#ffffff',
            cScale1: '#5d4037',
            cScaleInv1: '#ffffff',
            cScale2: '#795548',
            cScaleInv2: '#ffffff',
            cScale3: '#8d6e63',
            cScaleInv3: '#ffffff',
            cScale4: '#a1887f',
            cScaleInv4: '#ffffff',
            cScale5: '#d7ccc8',
            cScaleInv5: '#4e342e',
            cScale6: '#8d6e63',
            cScaleInv6: '#ffffff',
            cScale7: '#bf360c',
            cScaleInv7: '#ffffff',
            cScale8: '#e65100',
            cScaleInv8: '#ffffff',
            cScale9: '#ff6f00',
            cScaleInv9: '#ffffff',
            cScale10: '#ff8f00',
            cScaleInv10: '#ffffff',
            cScale11: '#ffb300',
            cScaleInv11: '#4e342e',

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
    'mindmap', 'timeline', 'gitGraph', 'C4Context', 'xychart-beta'
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

                // 修正 SVG 寬度與色彩同步
                const svgElement = containerRef.current.querySelector('svg');
                if (svgElement) {
                    svgElement.style.height = 'auto';

                    // 色彩同步邏輯：強力鎖定扇形顏色，消除透明度與亮度差
                    if (firstWord === 'pie') {
                        setTimeout(() => {
                            const svgEl = containerRef.current?.querySelector('svg');
                            if (!svgEl) return;

                            // 獲取所有圖例顏色
                            const legendRects = svgEl.querySelectorAll('.legend rect');
                            const slices = svgEl.querySelectorAll('.slice path, .pieSlice');

                            // 強制所有扇形及其容器不透明
                            svgEl.querySelectorAll('.slice, .pie').forEach(el => {
                                (el as HTMLElement).style.opacity = '1';
                                (el as HTMLElement).style.fillOpacity = '1';
                            });

                            legendRects.forEach((rect, idx) => {
                                if (slices[idx]) {
                                    const color = rect.getAttribute('fill');
                                    if (color) {
                                        const slice = slices[idx] as SVGPathElement;
                                        slice.style.fill = color;
                                        slice.style.fillOpacity = '1';
                                        slice.style.opacity = '1';
                                        slice.style.filter = 'none'; // 移除可能導致顏色發白的濾鏡
                                        slice.setAttribute('fill', color);
                                        slice.setAttribute('fill-opacity', '1');
                                    }
                                }
                            });
                        }, 50);
                    }

                    const isWideDiagram = ['mindmap', 'timeline', 'gantt', 'xychart-beta'].includes(firstWord);

                    if (window.innerWidth < 640) {
                        if (isWideDiagram) {
                            svgElement.style.minWidth = '600px'; // 確保複雜圖表不會縮得太小
                            svgElement.style.maxWidth = 'none';
                        } else {
                            svgElement.style.minWidth = 'auto';
                            svgElement.style.maxWidth = '100%';
                            svgElement.style.width = '100%';
                        }

                        // 針對圓餅圖 (pie) 的特殊優化：移動圖例到下方
                        if (firstWord === 'pie') {
                            const legend = svgElement.querySelector('.legend');
                            if (legend) {
                                const viewBox = svgElement.viewBox.baseVal;
                                const bbox = (legend as SVGGElement).getBBox();

                                // 將圖例移至下方中央
                                const targetX = (viewBox.width / 2) - (bbox.width / 2);
                                const targetY = viewBox.height + 10;
                                legend.setAttribute('transform', `translate(${targetX}, ${targetY})`);

                                // 擴大 viewBox 以容納下方圖例
                                svgElement.setAttribute('viewBox', `0 0 ${viewBox.width} ${viewBox.height + bbox.height + 40}`);
                            }
                        }
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
            {/* 行動端捲動提示 - 只在需要捲動的圖表顯示 */}
            {data.chart && ['mindmap', 'timeline', 'gantt', 'xychart-beta'].includes(data.chart.trim().split(/\s+/)[0]) && (
                <div className="sm:hidden flex items-center gap-1 mb-2 text-[10px] text-brand-taupe/60 uppercase tracking-widest font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    左右滑動檢視完整圖表
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                /* 心智圖與特定節點保持白色文字 */
                .mermaid-container .nodeText, 
                .mermaid-container .mindmap-node text,
                .mermaid-container .section-text,
                .mermaid-container foreignObject div {
                    color: white !important;
                    fill: white !important;
                    font-weight: 600 !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
                }

                /* 圓餅圖文字改為深色以提升可讀性 (僅針對文字內容) */
                .mermaid-container .slice text,
                .mermaid-container .legend text,
                .mermaid-container .pieTitleText {
                    fill: #1a1a1a !important;
                    color: #1a1a1a !important;
                    font-weight: 700 !important;
                    text-shadow: none !important;
                }

                /* 強制圓餅圖扇形顏色 100% 不透明，消除淡色效果 */
                .mermaid-container .slice path,
                .mermaid-container .pieSlice,
                .mermaid-container .legend rect {
                    fill-opacity: 1 !important;
                    opacity: 1 !important;
                    stroke-width: 0px !important;
                    filter: none !important;
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
