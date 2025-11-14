export type OverallEngagementResponse = {
  class: number[];        // e.g., [205.38, 317.39]
  label: string[];        // e.g., ["Week 1", "Week 2", ...]
  pre_semester: number[]; // e.g., [251.23, 371.6]
  show_peer: boolean;     // e.g., false
  unit: string;           // e.g., "FIT9131 Programming foundations in Java [DEMO ONLY]"
  user: number[];
};

export type WeeklyEngagementResponse = {
  class: number[];          // e.g., [127.2, 112.4, 55.0]
  label: string[];          // e.g., ["Lessons", "Workshop", "Applied Learning Session"]
  pre_semester: number[];   // e.g., [133.0, 121.0, 62.0]
  selected_week: number;    // e.g., 2
  show_peer: boolean;       // e.g., false
  unit: number;             // e.g., 4
  user: number[];           // e.g., [40.0, 26.3, 125.3]
  weeks: number[];          // e.g., [1, 2]
}

export type AssessmentPerformanceResponse = {
  class: number[][];        // array of arrays of numbers (e.g., [[8.5, 7.4, ...]])
  label: string[];          // e.g., ["Quiz 1"]
  pre_semester: number[][]; // array of arrays of numbers
  show_peer: boolean;       // e.g., false
  unit: number;             // e.g., 4
  user: {
    x: string;
    y: number;
  }[];        // e.g., [{ x: "Quiz 1", y: 7.5 }]
}