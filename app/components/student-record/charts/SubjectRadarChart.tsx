"use client";

import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type SubjectRadarItem = {
  subject: string;
  score: number;
  rawGrade: number | null;
};

export default function SubjectRadarChart({ data }: { data: SubjectRadarItem[] }) {
  const chartData = {
    labels: data.map((item) => item.subject),
    datasets: [
      {
        label: "과목별 역량",
        data: data.map((item) => item.score),
        backgroundColor: "rgba(15, 118, 110, 0.2)",
        borderColor: "#0f766e",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"radar">) => {
            const rawGrade = data[context.dataIndex]?.rawGrade;
            return ` 평균 등급: ${rawGrade ?? "데이터 없음"}`;
          },
        },
      },
    },
  };

  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-400">데이터가 없습니다.</div>;
  }

  return (
    <div className="h-[250px] w-full">
      <Radar data={chartData} options={options} />
    </div>
  );
}
