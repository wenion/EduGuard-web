"use client";
import { useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  type ChartOptions,
  type ChartEvent,
  type LegendItem,
} from "chart.js";
import { ensureChartRegistered } from "@/lib/chartSetup";
import { useSwitchTracking } from "@/context/useSwitchTracking";


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
  labels: (string | number)[];
  dUser: number[];  lUser: string;
  dPeers: number[]; lPeers: string;
  dPrev: number[];  lPrev: string;

  /**
   * IMPORTANT: your original jQuery had `hidden: show_peer`
   * (i.e. when `show_peer === true`, peer datasets were hidden).
   * To keep behavior identical, we preserve that inversion here.
   */
  showPeer: boolean;

  telemetry?: Telemetry;
};

export function WeeklyBar({
  labels, dUser, lUser, dPeers, lPeers, dPrev, lPrev, showPeer, telemetry,
}: Props) {
  const { logSelectTrace} = useSwitchTracking();
 
  useEffect(ensureChartRegistered, []);
  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        label: lUser,
        data: dUser,
        backgroundColor: "rgba(220, 118, 51, 0.7)",
        borderColor: "rgba(220, 118, 51, 1)",
        borderWidth: 1,
        animations: {
          y: { duration: 1000, delay: 200 },
        },
      },
      {
        hidden: showPeer, // keep original inversion
        label: lPeers,
        data: dPeers,
        backgroundColor: "rgba(46, 134, 193, 0.7)",
        borderColor: "rgba(46, 134, 193, 1)",
        borderWidth: 1,
        animations: {
          y: { duration: 1500, delay: 700 },
        },
      },
      {
        hidden: showPeer, // keep original inversion
        label: lPrev,
        data: dPrev,
        backgroundColor: "rgba(17, 120, 100, 0.7)",
        borderColor: "rgba(17, 120, 100, 1)",
        borderWidth: 1,
        animations: {
          y: { duration: 1500, delay: 700 },
        },
      },
    ],
  }), [labels, dUser, lUser, dPeers, lPeers, dPrev, lPrev, showPeer]);

  // Options: same legend onClick (default toggle) + telemetry; same scales
  const options = useMemo<ChartOptions<"bar">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }, // needs LinearScale registered (done in chartSetup)
    },
    plugins: {
      legend: {
        position: "top",
        display: true,
        onClick: (e: ChartEvent, legendItem: LegendItem, legend: any) => {
          // call Chart.js default toggle
          const defaultHandler = ChartJS?.defaults?.plugins?.legend?.onClick;
          if (typeof defaultHandler === "function") {
            defaultHandler.call(legend, e, legendItem, legend);
          } else {
            // minimal fallback toggle
            const ci = legend.chart;
            const idx = legendItem.datasetIndex!;
            const meta = ci.getDatasetMeta(idx);
            meta.hidden = meta.hidden === null ? !ci.data.datasets[idx].hidden : null;
            ci.update();
          }

          // telemetry (mirror of your chrome.runtime.sendMessage usage)
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

    // Root-level hover/click handlers to mirror your traces
    onHover(_event, activeElements) {
      if (activeElements?.length && telemetry?.onHover) {
        const { index, datasetIndex } = activeElements[0];
        // @ts-ignore accessing chart instance via `this`
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
        // @ts-ignore accessing chart instance via `this`
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

  // Let the parent control height: wrap this <WeeklyBar> in a container with fixed height.
  return <Bar data={data} options={options} id="weeklyEngagement" />;
}
