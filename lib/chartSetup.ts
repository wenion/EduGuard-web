// lib/chartSetup.ts
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";

// optional if you use boxplots
import { BoxPlotController, BoxAndWiskers } from "@sgratzl/chartjs-chart-boxplot";

let registered = false;

export function ensureChartRegistered() {
  if (registered) return;
  ChartJS.register(
    LineElement,
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,     // ← THIS is the missing one
    TimeScale,
    Tooltip,
    Legend,
    Title,
    Filler,
    BoxPlotController,
    BoxAndWiskers
  );
  registered = true;
}
