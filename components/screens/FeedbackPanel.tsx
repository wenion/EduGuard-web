import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Feedback, FeedbackSet } from "@/types/Feedback"; // Import type for feedback

function FeedbackCard({
  feedback,
  onPrevious,
  onNext,
}: {
  feedback: Feedback,
  onPrevious: () => void,
  onNext: () => void,
}) {
  return (
    <div className="space-y-6">
      <Card key={feedback.id} className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-medium">How you should improve?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{feedback.feedback}</p>

          <p className="text-sm text-muted-foreground mb-2">
            To better achieve the learning outcomes for Weeks 0 - 2, here are some suggestions that you may find helpful:
          </p>
          {feedback.actionable_advice.map((advice, index) => (
            <Item key={index} className="flex items-center justify-between">
              <span>{advice}</span>
            </Item>
          ))}

          <p className="text-sm text-muted-foreground mt-4">
            To support your achievement of the learning outcomes for Week 3, here are some suggestions:
          </p>
          {feedback.feedforward_actions.map((action, index) => (
            <Item key={index} className="flex items-center justify-between">
              <span>{action}</span>
            </Item>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onNext}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export function FeedbackPanel({ feedbackSet }: { feedbackSet: FeedbackSet }) {
  const [index, setIndex] = useState(0);
  const onPrevious = useCallback(() => {
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : feedbackSet.feedback_set.length - 1));
  }, [feedbackSet.feedback_set]);
  const onNext = useCallback(() => {
    setIndex((prevIndex) => (prevIndex < feedbackSet.feedback_set.length - 1 ? prevIndex + 1 : 0));
  }, [feedbackSet.feedback_set]);

  const current = useMemo(() => {
    return feedbackSet.feedback_set.length > 0 ? feedbackSet.feedback_set[index] : null;
  }, [feedbackSet.feedback_set, index]);
  return (
    <>
      {current && <FeedbackCard feedback={current} onPrevious={onPrevious} onNext={onNext} />}
    </>
  );
}
