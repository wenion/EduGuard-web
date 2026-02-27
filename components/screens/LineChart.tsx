"use client";
import { useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS,
  type ChartEvent,
  type LegendItem,
  type ChartOptions
 } from "chart.js";
import { ensureChartRegistered } from "@/lib/chartSetup";
import { useSwitchTracking } from "@/context/useSwitchTracking";

ensureChartRegistered();

type Telemetry = {
  onLegendClick?: (payload: {
    datasetIndex: number;
    text: string;
    visible: boolean; // after toggle
  }) => void;
  onHover?: (payload: {
    datasetIndex: number;
    index: number;
    label: string;
  }) => void;
  onDataClick?: (payload: {
    datasetIndex: number;
    index: number;
    label: string;
  }) => void;
};


type Props = {
  // same shape you used in DashboardView
  labels: (string | number)[];
  dUser: number[];  lUser: string;
  dPeers: number[]; lPeers: string;
  dPrev: number[];  lPrev: string;

  /**
   * IMPORTANT: In your original jQuery code, peer datasets had:
   *   hidden: show_peer
   * i.e. when `show_peer === true`, they were actually HIDDEN.
   */
  showPeer: boolean;

  telemetry?: Telemetry;
};

export function OverallLine({
  labels, dUser, lUser, dPeers, lPeers, dPrev, lPrev, showPeer, telemetry,
}: Props) {
  const { logSelectTrace} = useSwitchTracking();

  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        label: lUser,
        data: dUser,
        borderColor: "rgba(220, 118, 51, 1)",
        backgroundColor: "rgba(220, 118, 51, 0.2)",
        borderWidth: 2,
        radius: 4,
        pointRadius: 5,
        pointHoverRadius: 10,
        tension: 0.25,
        animations: { y: { duration: 1000, delay: 50 } },
      },
      {
        hidden: showPeer,
        label: lPeers,
        data: dPeers,
        borderColor: "rgba(46, 134, 193, 1)",
        backgroundColor: "rgba(46, 134, 193, 0.2)",
        borderDash: [5, 5],
        borderWidth: 2,
        radius: 4,
        pointRadius: 5,
        pointHoverRadius: 10,
        animations: { y: { duration: 1500, delay: 500 } },
      },
      {
        hidden: showPeer,
        label: lPrev,
        data: dPrev,
        borderColor: "rgba(17, 120, 100, 1)",
        backgroundColor: "rgba(17, 120, 100, 0.2)",
        borderDash: [5, 5],
        borderWidth: 2,
        radius: 4,
        pointRadius: 5,
        pointHoverRadius: 10,
        animations: { y: { duration: 2000, delay: 500 } },
      },
    ],
  }), [labels, dUser, lUser, dPeers, lPeers, dPrev, lPrev, showPeer]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animations: {
      y: {
        easing: "easeInOutElastic",
        from: (ctx: any) => {
          if (ctx?.type === "data" && ctx.mode === "default" && !ctx.dropped) {
            ctx.dropped = true;
            return 0;
          }
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        onClick: (e: ChartEvent, legendItem: LegendItem, legend: any) => {
          const defaultHandler = ChartJS?.defaults?.plugins?.legend?.onClick;
          if (typeof defaultHandler === "function") {
            defaultHandler.call(legend, e, legendItem, legend);
          } else {
            // fallback
            const ci = legend.chart;
            const idx = legendItem.datasetIndex!;
            const meta = ci.getDatasetMeta(idx);
            meta.hidden = meta.hidden === null ? !ci.data.datasets[idx].hidden : null;
            ci.update();
          }
          if (telemetry?.onLegendClick) {
            const meta = legend.chart.getDatasetMeta(legendItem.datasetIndex!);
            telemetry.onLegendClick({
              datasetIndex: legendItem.datasetIndex!,
              text: legendItem.text,
              visible: !meta.hidden,
            });
          }

          const canvas = legend.chart.canvas;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(legendItem.datasetIndex);
          logSelectTrace({
            type: 'chart legend click',
            text: `Dataset ${legendItem.datasetIndex} - [${legendItem.text}]: status - ${meta.hidden ? 'hidden' : 'visible'}` || null,
            tag: canvas.tagName,
            id: canvas.id || null,
            className: canvas.className || null,
          });
        },
      },
      tooltip: { intersect: false, mode: "index" },
    },
    onHover(_event, activeElements) {
      if (activeElements?.length && telemetry?.onHover) {
        const { index, datasetIndex } = activeElements[0];
        // @ts-ignore this refers to chart
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
        // @ts-ignore this refers to chart
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
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  return <Line data={data} options={options} id="overallEngagement" />;
}
