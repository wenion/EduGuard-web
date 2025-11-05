export type ActionPlanItem = {
  action_content: string;
  creation_time: string;              // ISO timestamp string
  id: number;
  marked_status_time: number;         // Unix timestamp (float)
  status: string;
  student_id: number;
  target_completion_date: string;     // dd/mm/yyyy format
  unit_id: number;
};

export type ActionPlanResponse = {
  action_plan: ActionPlanItem[];
}
