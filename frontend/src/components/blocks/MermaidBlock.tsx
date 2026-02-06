import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { MermaidBlock as MermaidBlockType } from '../../types/content';

// 初始化 mermaid
if (typeof window !== 'undefined') {
    mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        themeVariables: {
            primaryColor: '#6d4c41', // brand-accent
            primaryTextColor: '#fff',
            primaryBorderColor: '#6d4c41',
            lineColor: '#8d6e63',
            secondaryColor: '#efebe9',
            tertiaryColor: '#fff',
        },
        securityLevel: 'loose',
        fontFamily: 'var(--font-chen-yuluoyan), sans-serif',
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
                    svgElement.style.maxWidth = '100%';
                    svgElement.style.height = 'auto';
                }
            } catch (error) {
                console.error('Mermaid render failed:', error);
                containerRef.current.innerHTML = `<pre class="text-xs text-red-500 overflow-auto p-4 bg-red-50 rounded">${data.chart}</pre>`;
            }
        };

        renderChart();
    }, [data.chart]);

    return (
        <div className="mermaid-container my-12 flex flex-col items-center w-full px-4">
            <div
                ref={containerRef}
                className="w-full flex justify-center bg-white/30 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-6 shadow-inner border border-brand-taupe/5"
            >
                {/* SVG will be rendered here */}
            </div>
            {data.caption && (
                <p className="mt-4 text-sm text-brand-taupe italic font-medium">
                    {data.caption}
                </p>
            )}
        </div>
    );
};

export default MermaidBlock;
