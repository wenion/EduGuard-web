import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const currentWeek = useMemo(() => feedback.cur_week, [feedback]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    index: number,
    data: string[],
  ) => {
    setDraggingIndex(index);

    e.dataTransfer.setData("text/plain", data[index]);
    e.dataTransfer.effectAllowed = "move";
  };
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-medium">How you should improve?</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">
            <em>{feedback.feedback}</em>
          </CardDescription>

          <p className="text-base text-muted-foreground mt-2">
            <em>
            To better achieve the learning outcomes for Weeks 0 - {currentWeek}, here are some suggestions that you may find helpful:
            </em>
          </p>

          <ScrollArea className="h-72 rounded-md border flex mt-4">
            <div className="flex w-full flex-col gap-4 my-2 px-2">
              {feedback.actionable_advice.map((advice, index) => {
                const isDragging = draggingIndex === index;
                return (
                  <Item
                    draggable
                    variant="outline"
                    key={index}
                    className={[
                      "flex items-center justify-between border",
                      "hover:bg-slate-50",
                      "cursor-grab",
                      // isDragging ? "cursor-grabbing opacity-80" : "cursor-grab",
                    ].join(" ")}
                    onDragStart={(e) => handleDragStart(e, index, feedback.actionable_advice)}
                  >
                    <span>{advice}</span>
                  </Item>
                );
              })}
            </div>
          </ScrollArea>

          <p className="text-base text-muted-foreground mt-4">
            <em>
              To support your achievement of the learning outcomes for Week {currentWeek + 1}, here are some suggestions:
            </em>
          </p>

          <ScrollArea className="h-72 rounded-md border flex mt-4">
            <div className="flex w-full flex-col gap-4 my-2 px-2">
              {feedback.feedforward_actions.map((action, index) => (
                <Item
                  draggable
                  variant="outline"
                  key={index}
                  className="flex items-center justify-between border cursor-grab hover:bg-slate-50"
                  onDragStart={(e) => handleDragStart(e, index, feedback.feedforward_actions)}
                >
                  <span>{action}</span>
                </Item>
              ))}
            </div>
          </ScrollArea>
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
