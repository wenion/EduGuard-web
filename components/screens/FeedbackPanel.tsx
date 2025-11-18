import { useCallback, useMemo, useState } from "react";
import "@/app/globals.css";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, GripVertical, Lightbulb } from "lucide-react";

import { Feedback, FeedbackSet } from "@/types/Feedback"; // Import type for feedback

type FeedbackCardProps = {
  feedback: Feedback,
  onPrevious: () => void,
  onNext: () => void,
  className?: string,
}

function FeedbackCard({
  feedback,
  onPrevious,
  onNext,
  className,
}: FeedbackCardProps) {
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
    <div className={className}>
      <Card>
        <CardHeader>
          <CardAction className="col-start-1 row-span-2 row-start-1 justify-self-center self-center">
            <Lightbulb />
          </CardAction>
          <CardTitle className="font-thin lg:pr-16">Feedback summary</CardTitle>
          <CardDescription className="text-lg font-semibold text-black lg:pr-16">How you should improve?</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="py-2">Your Latest Feedback</Badge>
          <CardDescription className="text-lg font-normal text-black font-sans italic pt-2">
            {feedback.feedback}
          </CardDescription>

          <p className="text-base text-muted-foreground mt-2 italic">
            To better achieve the learning outcomes for Weeks 0 - {currentWeek}, here are some suggestions that you may find helpful:
          </p>

          <ScrollArea className="h-72 rounded-md border flex mt-4">
            <div className="flex w-full flex-col gap-4 my-2 px-2">
              {feedback.actionable_advice.map((advice, index) => {
                return (
                  <div
                    draggable
                    key={index}
                    className="flex items-center justify-between rounded-sm border hover:bg-slate-50 text-sm"
                    onDragStart={(e) => handleDragStart(e, index, feedback.actionable_advice)}
                  >
                    <span className="m-4 font-sans">{advice}</span>
                    <div className="min-width-40 cursor-grab m-4">
                      <GripVertical />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <p className="text-base text-muted-foreground italic mt-4">
            To support your achievement of the learning outcomes for Week {currentWeek + 1}, here are some suggestions:
          </p>

          <ScrollArea className="h-72 rounded-md border flex mt-4">
            <div className="flex w-full flex-col gap-4 my-2 px-2">
              {feedback.feedforward_actions.map((action, index) => (
                <div
                  draggable
                  key={index}
                  className="flex items-center justify-between rounded-sm border hover:bg-slate-50 text-sm"
                  onDragStart={(e) => handleDragStart(e, index, feedback.feedforward_actions)}
                >
                  <span className="m-4">{action}</span>
                  <div className="min-width-40 cursor-grab m-4">
                    <GripVertical />
                  </div>
                </div>
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

type FeedbackPanelProps = {
  feedbackSet: FeedbackSet,
  className?: string
};

export function FeedbackPanel({ feedbackSet, className }: FeedbackPanelProps) {
  const [index, setIndex] = useState(0);
  const onPrevious = useCallback(() => {
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : feedbackSet.feedback_set.length - 1));
  }, [feedbackSet.feedback_set]);
  const onNext = useCallback(() => {
    setIndex((prevIndex) => (prevIndex < feedbackSet.feedback_set.length - 1 ? prevIndex + 1 : 0));
  }, [feedbackSet.feedback_set]);

  const current = useMemo(() => {
    return feedbackSet.feedback_set.length > 0
      ? feedbackSet.feedback_set[index]
      : {
          id: 0,
          cur_week: 0,
          feedback: "",
          actionable_advice: [],
          feedforward_actions: [],
        };
  }, [feedbackSet.feedback_set, index]);

  return (
    <FeedbackCard className={className} feedback={current} onPrevious={onPrevious} onNext={onNext} />
  );
}
