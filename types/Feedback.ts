export type Feedback = {
  id: number;
  cur_week: number;
  feedback: string;
  actionable_advice: string[];
  feedforward_actions: string[];
};

export type FeedbackSet = {
  feedback_set: Feedback[];
};
