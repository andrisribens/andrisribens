'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { buildYTicks, getChartScale } from '@/app/utilities/chartScale';

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
  windDirections?: (number | undefined)[];
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
  timezoneLabel,
}: {
  charts: Array<{
    data: any;
    id: string;
    yAxisLabel: string;
    type: string;
    options?: any;
  }>;
  title: string;
  timezoneLabel?: string;
}) => {
  const [activeChartId, setActiveChartId] = useState<string>(
    charts[0]?.id || ''
  );

  const [arrowImage, setArrowImage] = useState<HTMLImageElement | null>(null);
  const [yAxisLayout, setYAxisLayout] = useState({
    top: 0,
    height: 0,
    plotHeight: 0,
  });

  const activeChart = charts.find((chart) => chart.id === activeChartId);

  useEffect(() => {
    const img = new Image();
    img.src = '/img/arrow-down.svg';
    img.onload = () => setArrowImage(img);
  }, []);

  const scaleMeta = useMemo(() => {
    if (!activeChart) {
      return {
        finalMin: 0,
        finalMax: 1,
        stepSize: 1,
        yTicks: [1, 0] as number[],
        pointCount: 0,
      };
    }

    const allValues = activeChart.data.datasets
      .map((d: ChartDataset) => d.data)
      .flat()
      .filter(
        (val: number | undefined): val is number => typeof val === 'number',
      );

    const autoScale = getChartScale(activeChart.id, allValues);

    const manualMin = activeChart.options?.scales?.y?.min;
    const manualMax = activeChart.options?.scales?.y?.max;
    const manualStep = activeChart.options?.scales?.y?.ticks?.stepSize;

    const finalMin =
      typeof manualMin === 'number' ? manualMin : autoScale.min;
    const finalMax =
      typeof manualMax === 'number' ? manualMax : autoScale.max;
    const stepSize =
      typeof manualStep === 'number' ? manualStep : autoScale.stepSize;

    return {
      finalMin,
      finalMax,
      stepSize,
      yTicks: buildYTicks(finalMin, finalMax, stepSize),
      pointCount: activeChart.data.labels.length,
    };
  }, [activeChart]);

  const { finalMin, finalMax, stepSize, yTicks, pointCount } = scaleMeta;

  useEffect(() => {
    setYAxisLayout({ top: 0, height: 0, plotHeight: 0 });
  }, [activeChartId, finalMin, finalMax, pointCount]);

  const yAxisSyncPlugin = useMemo(
    () => ({
      id: 'yAxisSync',
      afterLayout(chart: ChartJS) {
        const { top, height } = chart.chartArea;
        const plotHeight = chart.height;

        if (height <= 0 || plotHeight <= 0) return;

        setYAxisLayout((prev) => {
          if (
            prev.top === top &&
            prev.height === height &&
            prev.plotHeight === plotHeight
          ) {
            return prev;
          }

          return { top, height, plotHeight };
        });
      },
    }),
    [],
  );

  const getTickTop = useCallback(
    (tick: number) => {
      const { top, height, plotHeight } = yAxisLayout;

      if (height <= 0 || plotHeight <= 0 || finalMax === finalMin) {
        return undefined;
      }

      const ratio = (finalMax - tick) / (finalMax - finalMin);
      const yPx = top + ratio * height;

      return `${(yPx / plotHeight) * 100}%`;
    },
    [yAxisLayout, finalMin, finalMax],
  );

  if (!activeChart) return null;

  const renderYAxis = (side: 'left' | 'right') => (
    <div
      className={
        side === 'right'
          ? `${styles.chart__yAxis} ${styles['chart__yAxis--right']}`
          : styles.chart__yAxis
      }
      aria-hidden
    >
      <div className={styles.chart__yAxisTicks}>
        {yTicks.map((tick) => (
          <span
            key={`${side}-${tick}`}
            className={styles.chart__yAxisTick}
            style={{ top: getTickTop(tick) }}
          >
            {side === 'right' && (
              <span className={styles.chart__yAxisTickMark} aria-hidden />
            )}
            {Number(tick).toFixed(0)}
            {side === 'left' && (
              <span className={styles.chart__yAxisTickMark} aria-hidden />
            )}
          </span>
        ))}
      </div>
    </div>
  );

  const mergedOptions = {
    ...activeChart.options,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 4,
        bottom: 0,
        left: 0,
        right: 0,
      },
    },
    plugins: {
      legend: { display: false },
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
          display: false,
          stepSize,
        },
        grid: {
          display: true,
          drawOnChartArea: true,
          color: 'rgba(128, 128, 128, 0.22)',
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          drawOnChartArea: false,
        },
        border: {
          color: 'rgba(128, 128, 128, 0.35)',
        },
        ticks: {
          color: 'grey',
        },
      },
    },
  };

  const windDirectionPlugin =
    arrowImage && activeChart.id === 'wind'
      ? {
          id: 'windDirectionPlugin',
          afterDatasetsDraw(chart: any) {
            const meta = chart.getDatasetMeta(0);
            const dataset = chart.data.datasets[0];

            if (!dataset?.windDirections || !meta?.data?.length) return;

            dataset.windDirections.forEach((angle: number, index: number) => {
              const bar = meta.data[index];
              if (!bar || typeof angle !== 'number') return;

              const { x, y } = bar.tooltipPosition();

              const size = 24;

              const ctx = chart.ctx;

              const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

              const getCompassLabel = (angle: number) =>
                directions[Math.round(angle / 45) % 8];

              const label = getCompassLabel(angle);

              ctx.save();
              ctx.translate(x, y - 20); // position above bar
              ctx.rotate((angle * Math.PI) / 180);

              // Draw the arrow
              ctx.drawImage(arrowImage, -size / 2, -size / 2, size, size);

              // Draw direction label ABOVE arrow
              ctx.rotate((-angle * Math.PI) / 180); // reset rotation for label
              ctx.fillStyle = '#555';
              ctx.font = '10px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(label, 0, -size / 2 - 6); // 👈 ABOVE arrow

              ctx.restore();
            });
          },
        }
      : undefined;

  const chartPlugins = [
    yAxisSyncPlugin,
    ...(windDirectionPlugin ? [windDirectionPlugin] : []),
  ];

  const plotStyle = {
    '--chart-point-count': pointCount,
  } as React.CSSProperties;

  return (
    <div className={styles.chart}>
      {title && <h3 className={styles.chart__title}>{title}</h3>}
      {timezoneLabel && (
        <p className={styles.chart__timezone}>{timezoneLabel}</p>
      )}
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
      <div className={styles.chart__plotArea}>
        <div className={styles.chart__unitRow}>
          <span className={styles.chart__yAxisUnit}>{activeChart.yAxisLabel}</span>
        </div>
        <div className={styles.chart__frame}>
          {renderYAxis('left')}
          <div className={styles.chart__outerWrapper}>
            <div className={styles.chart__plot} style={plotStyle}>
              {activeChart.type === 'line' ? (
                <Line
                  data={activeChart.data}
                  options={mergedOptions}
                  plugins={chartPlugins}
                />
              ) : activeChart.type === 'bar' ? (
                <Bar
                  data={activeChart.data}
                  options={mergedOptions}
                  plugins={chartPlugins}
                />
              ) : null}
            </div>
          </div>
          {renderYAxis('right')}
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
export type { WeatherChartProps, ChartData };
