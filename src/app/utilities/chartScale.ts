export type ChartScale = {
  min: number;
  max: number;
  stepSize?: number;
};

function extractNumericValues(
  values: (number | null | undefined)[],
): number[] {
  return values.filter(
    (value): value is number => typeof value === 'number' && !Number.isNaN(value),
  );
}

function niceStep(range: number): number {
  if (range <= 0) return 1;

  const rough = range / 5;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function scaleFromData(
  values: number[],
  {
    minAtZero = false,
    maxCap,
    minCap,
    padFraction = 0.12,
    step,
    minSpan,
  }: {
    minAtZero?: boolean;
    maxCap?: number;
    minCap?: number;
    padFraction?: number;
    step?: number;
    minSpan?: number;
  } = {},
): ChartScale {
  if (values.length === 0) {
    return {
      min: minAtZero ? 0 : 0,
      max: maxCap ?? 10,
      stepSize: step ?? 1,
    };
  }

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = Math.max(rawMax - rawMin, minSpan ?? rawMax * 0.05, 1);
  const pad = span * padFraction;

  let min = minAtZero ? 0 : rawMin - pad;
  let max = rawMax + pad;

  if (minCap != null) min = Math.max(min, minCap);
  if (maxCap != null) max = Math.min(max, maxCap);

  const tickStep = step ?? niceStep(max - min);

  if (!minAtZero) {
    min = Math.floor(min / tickStep) * tickStep;
  }

  max = Math.ceil(max / tickStep) * tickStep;

  if (minCap != null) min = Math.max(min, minCap);
  if (maxCap != null) max = Math.min(max, maxCap);
  if (max <= min) max = min + tickStep;

  return { min, max, stepSize: tickStep };
}

function getUvScale(values: number[]): ChartScale {
  if (values.length === 0) {
    return { min: 0, max: 5, stepSize: 1 };
  }

  const peak = Math.max(...values);
  const withHeadroom = peak * 1.15 + 0.5;
  const max = Math.max(3, Math.ceil(withHeadroom));

  return { min: 0, max, stepSize: 1 };
}

export function getChartScale(
  chartId: string,
  values: (number | null | undefined)[],
): ChartScale {
  const numeric = extractNumericValues(values);

  switch (chartId) {
    case 'temperature':
      return scaleFromData(numeric, { step: 2, padFraction: 0.1, minSpan: 4 });
    case 'wind':
    case 'gust':
      return scaleFromData(numeric, { minAtZero: true, step: 1, minSpan: 2 });
    case 'humidity':
      return scaleFromData(numeric, {
        minCap: 0,
        maxCap: 100,
        step: 5,
        minSpan: 10,
      });
    case 'cloudarea':
      return scaleFromData(numeric, {
        minCap: 0,
        maxCap: 100,
        step: 10,
        minSpan: 20,
      });
    case 'precipprob':
      return scaleFromData(numeric, {
        minAtZero: true,
        maxCap: 100,
        step: 10,
        minSpan: 20,
      });
    case 'pressure':
      return scaleFromData(numeric, { padFraction: 0.08, step: 1, minSpan: 4 });
    case 'uv':
      return getUvScale(numeric);
    default:
      return scaleFromData(numeric);
  }
}

export function buildYTicks(
  min: number,
  max: number,
  stepSize?: number,
): number[] {
  const step = stepSize && stepSize > 0 ? stepSize : niceStep(max - min);
  const ticks: number[] = [];

  for (let value = min; value <= max + step * 0.001; value += step) {
    ticks.push(Math.round(value * 1000) / 1000);
  }

  return ticks.reverse();
}
