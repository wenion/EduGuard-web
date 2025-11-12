export async function overallEngagement(authorizedFetch: typeof fetch, unit: number, mode = "weekly") {
  const r = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/user/overall_engagement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unit, mode }),
  });
  if (!r.ok) throw new Error("overall_engagement failed");
  return r.json() as Promise<{
    show_peer: boolean;
    label: string[];
    user: number[];
    class: number[];
    pre_semester: number[];
    unit: string;
  }>;
}

export async function weeklyEngagement(authorizedFetch: typeof fetch, unit: number, week: string | number = "latest") {
  const r = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/user/weekly_engagement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unit, week }),
  });
  if (!r.ok) throw new Error("weekly_engagement failed");
  return r.json() as Promise<{
    show_peer: boolean;
    label: string[];
    weeks: (string|number)[];
    selected_week: string;
    user: number[];
    class: number[];
    pre_semester: number[];
    unit: string;
  }>;
}

export async function assessmentPerformance(authorizedFetch: typeof fetch, unit: number) {
  const r = await authorizedFetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/user/assessment_performance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unit }),
  });
  if (!r.ok) throw new Error("assessment_performance failed");
  return r.json() as Promise<{
    show_peer: boolean;
    label: string[];
    user: number[];         // user points aligned to labels
    class: any[];           // peers boxplot data
    pre_semester: any[];    // prev boxplot data
    unit: string;
  }>;
}
