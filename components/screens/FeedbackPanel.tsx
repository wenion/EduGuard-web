import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, GripVertical, Lightbulb } from "lucide-react";

import { Feedback, FeedbackSet } from "@/types/Feedback"; // Import type for feedback
import { useScrollAreaTracking } from "@/context/useScrollAreaTracking";
import { useSwitchTracking } from "@/context/useSwitchTracking";

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
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef2 = useRef<HTMLDivElement | null>(null);
  const currentWeek = useMemo(() => feedback.cur_week, [feedback]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const { logSelectTrace } = useSwitchTracking();

  const handleDragStart = (
    e: React.DragEvent,
    index: number,
    data: string[],
  ) => {
    setDraggingIndex(index);

    const target = e.target as HTMLDivElement;
    const payload = {
      index: index + 1,
      text: data[index],
      id: target.id,
    }
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";

    logSelectTrace({
      type: "drag start",
      text: target.innerText,
      tag: "LI",
      id: target.id,
      className: typeof target.className === "string" ? target.className : null,
      feedback_set_index: index + 1,
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number, id: string) => {
    const target = e.target as HTMLDivElement;
    logSelectTrace({
      type: "drag click",
      text: target.innerText,
      tag: "LI",
      id: id,
      className: typeof target.className === "string" ? target.className : null,
      feedback_set_index: index + 1,
    });
  }

  useScrollAreaTracking(scrollAreaRef);
  useScrollAreaTracking(scrollAreaRef2);

  return (
    <div className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-thin uppercase">Feedback summary</CardTitle>
          <CardDescription className="text-lg font-semibold text-black">
            <h2 id="improvementHeading">How you should improve?</h2>
          </CardDescription>
          <CardAction className="justify-self-center self-center">
            <Lightbulb />
          </CardAction>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="py-2">Your Latest Feedback</Badge>
          {feedback.feedback !== "" && (
            <CardDescription className="text-lg font-normal text-black font-sans italic pt-2">
              <p id="prescriptive-outcome" attr-class="main-text">
                {feedback.feedback}
              </p>
            </CardDescription>
          )}

          {feedback.actionable_advice.length !== 0 && (
            <>
              <p className="text-base text-muted-foreground mt-2 italic" id="feedback-comment" attr-class="comments">
                {`To better achieve the learning outcomes for Weeks 1 - ${currentWeek}, here are some suggestions that you may find helpful:`}
              </p>

              <ScrollArea ref={scrollAreaRef} className="h-60 rounded-md border flex mt-4" attr-class="ul-container">
                <ul id="todo-list" className="flex w-full flex-col gap-4 my-2 px-2" attr-class="list-group">
                  {feedback.actionable_advice.map((advice, index) => {
                    return (
                      <li
                        id={`actionItem${index}`}
                        draggable
                        key={index}
                        className="flex items-center justify-between rounded-sm border hover:bg-slate-50 text-sm"
                        onDragStart={(e) => handleDragStart(e, index, feedback.actionable_advice)}
                      >
                        <span className="m-4 font-sans" attr-class="action-details actionable-items">{advice}</span>
                        <div
                          id={`actionItem${index}`}
                          className="min-width-40 cursor-grab m-4"
                          attr-class="drag-icon"
                          onMouseDown={(e) => handleClick(e, index, `actionItem${index}`)}
                        >
                          <GripVertical />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </>
          )}
          <p className="text-base text-muted-foreground italic mt-4" id="feedforward-comment">
            {feedback.feedforward_actions.length !== 0 &&
              `To support your achievement of the learning outcomes for Week ${currentWeek + 1}, here are some suggestions that you may find helpful:`
            }
          </p>

          <ScrollArea ref={scrollAreaRef2} className="h-60 rounded-md border flex mt-4" attr-class="ul-container mb-2">
            <ul id="future-todo-list" className="flex w-full flex-col gap-4 my-2 px-2" attr-class="list-group">
              {feedback.feedforward_actions.map((action, index) => (
                <li
                  id={`actionItem${index + feedback.actionable_advice.length}`}
                  draggable
                  key={index}
                  className="flex items-center justify-between rounded-sm border hover:bg-slate-50 text-sm"
                  onDragStart={(e) => handleDragStart(e, index, feedback.feedforward_actions)}
                >
                  <span className="m-4" attr-class="action-details actionable-items">{action}</span>
                  <div
                    id={`actionItem${index + feedback.actionable_advice.length}`}
                    className="min-width-40 cursor-grab m-4"
                    attr-class="drag-icon"
                    onMouseDown={(e) => handleClick(e, index, `actionItem${index + feedback.actionable_advice.length}`)}
                  >
                    <GripVertical />
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            id="preFeedbackBtn"
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          <Button
            id="nextFeedbackBtn"
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
