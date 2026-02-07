import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { RadarChartBlock as RadarChartBlockType } from '../../types/content';

// 註冊 Radar Chart 必要的組件
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    Title
);

interface RadarChartBlockProps {
    data: RadarChartBlockType;
}

const RadarChartBlock: React.FC<RadarChartBlockProps> = ({ data }) => {
    const chartData = useMemo(() => {
        const labels = Array.isArray(data.labels) ? data.labels : [];
        const datasets = Array.isArray(data.datasets) ? data.datasets : [];

        // 定義顏色序列 (與報告一致)
        const colors = [
            { border: '#6A1B9A', bg: 'rgba(106, 27, 154, 0.2)' }, // 深紫 (續讀)
            { border: '#00897B', bg: 'rgba(0, 137, 123, 0.2)' }, // 藍綠 (普高)
            { border: '#FF6F00', bg: 'rgba(255, 111, 0, 0.2)' }, // 鮮橘 (技職)
        ];

        return {
            labels: labels,
            datasets: datasets.map((ds, index) => ({
                label: ds.label,
                data: ds.data,
                borderColor: colors[index % colors.length].border,
                backgroundColor: colors[index % colors.length].bg,
                pointBackgroundColor: colors[index % colors.length].border,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: colors[index % colors.length].border,
                borderWidth: 3,
                pointRadius: 4,
            })),
        };
    }, [data]);

    const options = useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    pointLabels: {
                        font: {
                            size: 14,
                            family: '"Noto Sans TC", sans-serif',
                            weight: 'bold' as const
                        },
                        color: '#4B5563'
                    },
                    ticks: {
                        display: false, // 隱藏數值標記，使畫面簡潔
                        stepSize: 20
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            family: '"Noto Sans TC", sans-serif',
                            weight: 'bold' as const
                        },
                        color: '#4B5563',
                        usePointStyle: true,
                        pointStyle: 'circle' as const
                    }
                },
                title: {
                    display: !!data.title,
                    text: data.title || '',
                    padding: { bottom: 20 },
                    color: '#6A1B9A',
                    font: {
                        size: 24,
                        family: '"Noto Sans TC", sans-serif',
                        weight: 'bold' as const
                    }
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
                        label: function (context: any) {
                            return ` ${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        };
    }, [data.title]);

    return (
        <div className="w-full max-w-4xl mx-auto my-12 p-6 sm:p-10 bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 transition-all hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="relative h-[450px]">
                <Radar data={chartData} options={options} />
            </div>
            {/* 報告風格的裝飾線 */}
            <div className="mt-8 flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-purple-800 to-teal-500 rounded-full opacity-30"></div>
            </div>
        </div>
    );
};

export default RadarChartBlock;
