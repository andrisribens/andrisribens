'use client';

import React, { useState } from 'react';
import styles from './ChartComponent.module.scss';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { div } from 'motion/react-client';

interface WeatherChartProps {
  data: ChartData;
  id: string;
}

interface ChartDataset {
  label: string;
  data: (number | undefined)[];
  useGradient?: boolean;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  tension?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartComponent = ({
  charts,
  title,
}: {
  charts: Array<{
    data: any;
    id: string;
    yAxisLabel: string;
    type: string;
    options?: any;
  }>;
  title: string;
}) => {
  const [activeChartId, setActiveChartId] = useState<string>(
    charts[0]?.id || ''
  );

  const activeChart = charts.find((chart) => chart.id === activeChartId);

  if (!activeChart) return null; // Prevent errors when `activeChart` is undefined

  // Collect all values
  const allValues = activeChart.data.datasets
    .flatMap((d) => d.data)
    .filter((val): val is number => typeof val === 'number');

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);

  // Round only min and max to cleaner values
  const buffer = (rawMax - rawMin) * 0.1;
  const calculatedMin = Math.floor((rawMin - buffer) / 5) * 5;
  const calculatedMax = Math.ceil((rawMax + buffer) / 5) * 5;

  // Use manually defined values if present, otherwise use calculated ones
  const manualMin = activeChart.options?.scales?.y?.min;
  const manualMax = activeChart.options?.scales?.y?.max;

  const finalMin = typeof manualMin === 'number' ? manualMin : calculatedMin;
  const finalMax = typeof manualMax === 'number' ? manualMax : calculatedMax;

  const isTemperature = activeChart.id === 'temperature';
  const stepSize = isTemperature ? 2 : undefined;

  const mergedOptions = {
    ...activeChart.options,
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        padding: 15,
        displayColors: false,
      },
    },
    scales: {
      y: {
        min: finalMin,
        max: finalMax,
        ticks: {
          stepSize: stepSize,
          callback: (value) => Number(value).toFixed(0),
        },
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          align: 'end',
          text: activeChart.yAxisLabel,
        },
      },
      yRight: {
        type: 'linear',
        position: 'right',
        min: finalMin,
        max: finalMax,
        ticks: {
          stepSize: stepSize,
          callback: (value) => Number(value).toFixed(0),
        },
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          align: 'end',
          text: activeChart.yAxisLabel,
        },
      },
    },
  };

  return (
    <div className={styles.chart}>
      {title && <h3 className={styles.chart__title}>{title}</h3>}
      <div className={styles.chartbuttons}>
        {charts.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChartId(chart.id)}
            className={
              chart.id === activeChartId
                ? `${styles.chartbuttons__btn} + ${styles.active}`
                : styles.chartbuttons__btn
            }
          >
            {chart.data.datasets[0].label}
            <span>{chart.yAxisLabel}</span>
          </button>
        ))}
      </div>
      <div className={styles.chart__outerWrapper}>
        <div className={styles.chart__innerWrapper}>
          {activeChart.type === 'line' ? (
            <Line data={activeChart.data} options={mergedOptions} />
          ) : activeChart.type === 'bar' ? (
            <Bar data={activeChart.data} options={mergedOptions} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
export type { WeatherChartProps, ChartData };
