"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function GradeTrendChart({ data }: { data: { label: string; grade: number }[] }) {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: '학기별 평균 등급',
        data: data.map(d => d.grade),
        borderColor: '#8b1a1a',
        backgroundColor: 'rgba(139, 26, 26, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        reverse: true,
        min: 1,
        max: 9,
        ticks: { stepSize: 1 }
      }
    },
    plugins: {
      legend: { display: false },
    }
  };

  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-sm text-slate-400">데이터가 없습니다.</div>;

  return <div className="h-[250px] w-full"><Line data={chartData} options={options} /></div>;
}
