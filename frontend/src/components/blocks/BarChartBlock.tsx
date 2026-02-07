import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChartBlock as BarChartBlockType } from '../../types/content';

// 註冊 Bar Chart 必要的組件
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface BarChartBlockProps {
    data: BarChartBlockType;
}

const BarChartBlock: React.FC<BarChartBlockProps> = ({ data }) => {
    const chartData = useMemo(() => {
        const labels = Array.isArray(data.labels) ? data.labels : [];
        const datasets = Array.isArray(data.datasets) ? data.datasets : [];

        // 定義配色 (與報告一致)
        const colors = [
            { bg: '#6A1B9A', hover: '#4A148C' }, // 深紫 (華德福優勢)
            { bg: '#CBD5E1', hover: '#94A3B8' }, // 灰藍 (體制內對照)
            { bg: '#00897B', hover: '#00695C' }, // 藍綠
            { bg: '#FF6F00', hover: '#E65100' }, // 鮮橘
        ];

        return {
            labels: labels,
            datasets: datasets.map((ds, index) => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: colors[index % colors.length].bg,
                hoverBackgroundColor: colors[index % colors.length].hover,
                borderRadius: 6,
                borderSkipped: false,
            })),
        };
    }, [data]);

    const options = useMemo(() => {
        return {
            indexAxis: data.horizontal ? 'y' as const : 'x' as const,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        font: {
                            family: '"Noto Sans TC", sans-serif',
                            size: 13,
                        },
                    },
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
                        font: {
                            family: '"Noto Sans TC", sans-serif',
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    position: 'bottom' as const,
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            family: '"Noto Sans TC", sans-serif',
                            weight: 'bold' as const,
                        },
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
                    callbacks: {
                        label: function (context: any) {
                            return ` ${context.dataset.label}: ${context.raw}${data.unit || ''}`;
                        }
                    }
                },
            },
        };
    }, [data.title, data.horizontal, data.unit]);

    return (
        <div className="w-full max-w-4xl mx-auto my-12 p-6 sm:p-10 bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 transition-all hover:shadow-2xl hover:shadow-purple-900/10">
            <div className={`relative ${data.horizontal ? 'h-[500px]' : 'h-[400px]'}`}>
                <Bar data={chartData} options={options} />
            </div>
            {/* 報告風格的裝飾線 */}
            <div className="mt-8 flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-purple-800 to-slate-300 rounded-full opacity-30"></div>
            </div>
        </div>
    );
};

export default BarChartBlock;
