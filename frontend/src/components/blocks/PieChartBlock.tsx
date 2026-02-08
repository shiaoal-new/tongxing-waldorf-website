import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChartBlock as PieChartBlockType } from '../../types/content';

// 註冊 Chart.js 必要的組件
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface PieChartBlockProps {
    data: PieChartBlockType;
}

const PieChartBlock: React.FC<PieChartBlockProps> = ({ data }) => {
    const chartData = useMemo(() => {
        // 防禦性檢查：確保 data.data 存在且為陣列
        const items = Array.isArray(data.data) ? data.data : [];

        return {
            labels: items.map(item => item.name),
            datasets: [
                {
                    label: data.title || '比例',
                    data: items.map(item => item.value),
                    backgroundColor: [
                        '#6A1B9A', // 深紫 (跟隨報告風格)
                        '#00897B', // 藍綠
                        '#FF6F00', // 鮮橘
                        '#FFD600', // 亮黃
                        '#9E9E9E', // 灰色
                        '#ad1457', // 桃紅
                        '#1565c0', // 靛藍
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 15,
                },
            ],
        };
    }, [data]);

    const options = useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom' as const,
                    labels: {
                        padding: 25,
                        font: {
                            size: 14,
                            family: '"Noto Sans TC", sans-serif',
                            weight: 'bold' as const,
                        },
                        color: '#4B5563',
                        usePointStyle: true,
                        pointStyle: 'circle' as const,
                    },
                },
                title: {
                    display: !!data.title,
                    text: data.title || '',
                    padding: { bottom: 20 },
                    color: '#6A1B9A',
                    font: {
                        size: 24,
                        family: '"Noto Sans TC", sans-serif',
                        weight: 'bold' as const,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1f2937',
                    bodyColor: '#1f2937',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        title: () => '',
                        label: function (context: any) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return ` ${label} ${percentage}%`;
                        }
                    }
                },
            },
            cutout: '60%', // 圓環圖效果，與報告一致
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 2000,
                easing: 'easeOutQuart' as const,
            },
        };
    }, [data.title, data.unit]);

    return (
        <div className="w-full max-w-2xl mx-auto my-12 p-6 sm:p-10 bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 transition-all hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="relative h-[400px]">
                <Doughnut data={chartData} options={options} />
            </div>
            {/* 報告風格的裝飾線 */}
            <div className="mt-8 flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-purple-800 to-orange-500 rounded-full opacity-30"></div>
            </div>
        </div>
    );
};

export default PieChartBlock;
