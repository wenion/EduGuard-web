"use client";
import { useEffect, useMemo } from "react";
import { Chart } from "react-chartjs-2";
import { Chart as ChartJS,
  type ChartEvent,
  type LegendItem,
  type ChartOptions
 } from "chart.js";
import { ensureChartRegistered } from "@/lib/chartSetup";
import { useSwitchTracking } from "@/context/useSwitchTracking";

type Telemetry = {
  onLegendClick?: (e: { datasetIndex: number; text: string; visible: boolean }) => void; // ← added
  onLegendToggle?: (label: string, visible: boolean) => void; // keep if other charts use it
  onHover?: (p: { datasetIndex: number; index: number; label: string }) => void;
  onDataClick?: (p: { datasetIndex: number; index: number; label: string }) => void;
};

type Props = {
  labels: string[];
  dUser: {x: string; y: number}[];
  lUser: string;
  dPrev: any[];
  lPrev: string;
  dPeers: number[][];
  lPeers: string;
  showPeer: boolean;
  telemetry?: Telemetry;
};


export function AssessmentBoxplot({
  labels, dUser, lUser, dPeers, lPeers, dPrev, lPrev, showPeer, telemetry,
}: Props) {
  const { logSelectTrace } = useSwitchTracking();

  useEffect(ensureChartRegistered, []);

  const safeFixed = (value: unknown, digits = 3) =>
    typeof value === "number" ? value.toFixed(digits) : "N/A";

  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        type: "line" as const,
        label: lUser,
        data: dUser,
        pointStyle: 'triangle',
        pointRadius: 8,
        backgroundColor: "rgba(220, 118, 51, 0.8)",
        borderDash: [5, 5],
        borderColor: "rgba(220, 118, 51, 0.5)"
      },
      { 
        type: "boxplot" as const, 
        label: lPeers, 
        data: dPeers, 
        hidden: showPeer,
        backgroundColor: "rgba(46, 134, 193, 0.7)",
        borderWidth: 3,
        borderRadius: 5,
        outlierColor: 'rgba(105, 105, 105, 1)',
        itemRadius: 2,
      },
      { 
        type: "boxplot" as const, 
        label: lPrev,  
        data: dPrev,  
        hidden: showPeer,
        backgroundColor: "rgba(17, 120, 100, 0.7)",
        borderWidth: 3,
        borderRadius: 5,
        outlierColor: "rgba(105, 105, 105, 1)",
        itemRadius: 2 
      },
    ],
  }), [labels, dUser, lUser, dPeers, lPeers, dPrev, lPrev, showPeer]);

   // 3) Match the options generic to the chart type ("boxplot")
  const options = useMemo<ChartOptions<"boxplot">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true },
    },
    interaction: {
      mode: "nearest",      // detect closest point
      intersect: false,     // don't require perfect overlap
    },
    plugins: {
      legend: {
        position: "top",
        display: true,
        onClick: (e: ChartEvent, legendItem: LegendItem, legend: any) => {
          // Default Chart.js toggle
          const defaultHandler = ChartJS?.defaults?.plugins?.legend?.onClick;
          if (typeof defaultHandler === "function") {
            defaultHandler.call(legend, e, legendItem, legend);
          } else {
            // Minimal fallback
            const ci = legend.chart;
            const idx = legendItem.datasetIndex!;
            const meta = ci.getDatasetMeta(idx);
            meta.hidden = meta.hidden === null ? !ci.data.datasets[idx].hidden : null;
            ci.update();
          }

          // Telemetry (both variants supported)
          const meta = legend.chart.getDatasetMeta(legendItem.datasetIndex!);
          telemetry?.onLegendClick?.({
            datasetIndex: legendItem.datasetIndex!,
            text: legendItem.text,
            visible: !meta.hidden,
          });
          telemetry?.onLegendToggle?.(legendItem.text, !meta.hidden);

          const canvas = legend.chart.canvas;
          logSelectTrace({
            type: 'chart legend click',
            text: `Dataset ${legendItem.datasetIndex} - [${legendItem.text}]: status - ${meta.hidden ? 'hidden' : 'visible'}` || null,
            tag: canvas.tagName,
            id: canvas.id || null,
            className: canvas.className || null,
          });
        },
      },
      tooltip: {
        enabled: true,
        intersect: false,
        mode: "nearest",
        callbacks: {
          label: (context) => {
            const dataset = context.dataset;
            const label = dataset.label || '';

            if (label === "Your assessment performance") {
              return `${label}: ${context.parsed.y}`;
            }

            const parsed = context.parsed as any;
            if (!parsed) return 'unparsed data';

            const min = parsed.min;
            const max = parsed.max;
            const q1 = parsed.q1;
            const q3 = parsed.q3;

            const median = safeFixed(parsed.median);
            const mean = safeFixed(parsed.mean);

            return [
              `${label}: `,
              `min: ${min}`,
              `25% quantile: ${q1}`,
              `median: ${median}`,
              `mean: ${mean}`,
              `75% quantile: ${q3}`,
              `max: ${max}`,
            ];
          },
        },
      }
    },

    onHover(_event, activeElements) {
      if (activeElements?.length && telemetry?.onHover) {
        const { index, datasetIndex } = activeElements[0];
        // @ts-ignore access chart instance via this
        const label = this.data?.datasets?.[datasetIndex]?.label ?? "";
        telemetry.onHover({ datasetIndex, index, label });

        const chart = this as any;
        const canvas = chart?.canvas as HTMLCanvasElement | undefined;
        logSelectTrace({
          type: 'chart data hover',
          text: `Dataset ${datasetIndex} - [${label}] - [hovered] - index ${index}`,
          tag: canvas?.tagName,
          id: canvas?.id || null,
          className: canvas?.className || null,
        });
      }
    },
    onClick(_event, activeElements) {
      if (activeElements?.length && telemetry?.onDataClick) {
        const { index, datasetIndex } = activeElements[0];
        // @ts-ignore access chart instance via this
        const label = this.data?.datasets?.[datasetIndex]?.label ?? "";
        telemetry.onDataClick({ datasetIndex, index, label });

        const nativeEvent = _event.native as MouseEvent | undefined;
        const canvas = nativeEvent?.target as HTMLCanvasElement | null;
        logSelectTrace({
          type: 'chart data click',
          text: `Dataset ${datasetIndex} - [${label}] - [clicked] - index ${index}` || null,
          tag: canvas?.tagName,
          id: canvas?.id || null,
          className: canvas?.className || null,
        });
      }
    },
  }), [telemetry]);

  return <Chart type="boxplot" data={data as any} options={options as any} id="assessmentCanvas"/>;
}

