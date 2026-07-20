"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type GradeDistributionItem = {
  subject: string;
  rawScore: number;
  scoreAverage: number;
  diff: number;
};

export default function GradeDistributionChart({ data }: { data: GradeDistributionItem[] }) {
  const chartData = {
    labels: data.map((item) => item.subject),
    datasets: [
      {
        label: "학생점수 - 평균 점수",
        data: data.map((item) => item.diff),
        backgroundColor: data.map((item) =>
          item.diff > 0 ? "rgba(15, 118, 110, 0.7)" : "rgba(139, 26, 26, 0.7)",
        ),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            const target = data[context.dataIndex];
            return ` 학생점수: ${target.rawScore} / 평균: ${target.scoreAverage}`;
          },
        },
      },
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center rounded-[20px] bg-[#faf6f0] text-sm text-slate-400">
        학생점수와 평균 점수가 추출된 과목이 없습니다. (현재 파서가 추출 중)
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
