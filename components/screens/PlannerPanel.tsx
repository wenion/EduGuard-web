import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Item } from "@/components/ui/item";
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Plus as PlusIcon,
  Check as CheckIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  Save as SaveIcon,
  SquareKanban as SquareKanbanIcon
} from "lucide-react";

import { DatePicker } from "@/components/date-picker";
import { useAuth } from "@/context/AuthContext";
import { createActionPlanRequest } from "@/lib/authApi";

type PlannerProps = {
  index: number;
  content: string;
  onDelete: (index: number) => void;
  onDateSelect: (date: string) => void;
  isLast?: boolean;
  lastRef?: React.Ref<HTMLDivElement>;
  invalid?: boolean;
};

function Planner({ index, content, onDelete, onDateSelect, isLast, lastRef, invalid }: PlannerProps) {
  const [edit, setEdit] = useState(content === "" ? true : false);

  return (
    <Item
      variant="outline"
      className="flex items-center justify-between border h-fit"
      ref={isLast ? lastRef : undefined}
      id = {`planner-item-${index}`}
    >
      <div className="flex w-full gap-2">
        {edit ? (
          <Textarea defaultValue={content} className="min-w-3/5"/>
        ) : (
          <div className="w-3/4">{content}</div>
        )}
        {edit ? (
          <div className="flex justify-center items-center px-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setEdit(false)}
                >
                  <SaveIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Done</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex flex-col">
            <DatePicker onDateChanged={onDateSelect} className="" invalid={invalid}/>
            <div className="flex justify-center gap-4 my-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setEdit(true)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onDelete(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </Item>
  )
}

type PlannerPanelProps = {
  onAddPlanner: (data: {item: string, date: string}[]) => void,
  className?: string
};

export function PlannerPanel({onAddPlanner, className}: PlannerPanelProps) {
  const { authorizedFetch, selectedUnitId } = useAuth();
  const [data, setData] = useState<{item: string, date: string}[]>([]);
  const [invalidIndex, setInvalidIndex] = useState<number | null>(null);

  const items = [
    {title:"S", value: "Make tasks Specific by clearly defining the action and outcome (e.g., “Summarize key points from Week 4 lecture”)."},
    {title:"M", value: "Ensure tasks are Measurable by including criteria to track completion (e.g., “Write a 1-page summary”)."},
    {title:"B", value: "Confirm tasks are Achievable by choosing steps you can realistically complete within the time available."},
    {title:"R", value: "Set Relevant goals that directly support your broader academic or personal objectives."},
    {title:"T", value: "Assign a Time-bound deadline to each task to stay accountable (e.g., “Complete by Friday at 6 PM”)."}
  ]

  const scrollRef = useRef<HTMLDivElement>(null); // container reference
  const lastItemRef = useRef<HTMLDivElement>(null); // last added item reference

  const onDelete = (index: number) => {
    setData((prev) => prev.filter((_, i) => i !== index));
  }

  const onSave = () => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      if (!item.item || !item.date) {
        console.log("Item or date is empty for index", i);
        setInvalidIndex(i);

        const row = document.getElementById(`planner-item-${i}`);
        row?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    if (selectedUnitId) {
      try {
        const res = createActionPlanRequest(authorizedFetch, selectedUnitId, data);
        onAddPlanner(data);
        setData([]);
      } catch (e: any) {
        console.error("Failed to save action plan data:", e);
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newDate = e.dataTransfer.getData("text/plain");
    const newItem = {item: newDate, date: ""};
    setData((prev) => [...prev, newItem]);
  };

  useEffect(() => {
    if (lastItemRef.current) {
      lastItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [data]);

  const handleDragOver = (e: React.DragEvent) => {
    // Allow drop
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-thin uppercase">Action planning</CardTitle>
          <CardDescription className="text-lg font-semibold text-black">How about developing an action plan for improvement?</CardDescription>
          <CardAction className="justify-self-center self-center">
            <SquareKanbanIcon />
          </CardAction>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="py-2">Set Your Learning Goals</Badge>
          <CardDescription className="text-lg font-normal text-black font-sans italic pt-2">
            Outline specific learning activities to support your improvement.
          </CardDescription>

          <ul className="text-base text-muted-foreground mt-2 space-y-2">
            {items.map((item, index) => (
              <li key={index}>
                <b>{item.title}{": "}</b>
                {item.value}
              </li>)
            )}
          </ul>

          <Separator className="my-4" />

          <div className="flex justify-end my-4 gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setData((prev) => [...prev, {item: "", date: ""}])}
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Plan Item</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 cursor-pointer"
              onClick={onSave}
            >
              <CheckIcon className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </div>

          <ScrollArea
            className="h-60 rounded-md border flex mt-4"
            onDrop={(e) => handleDrop(e)}
            onDragOver={handleDragOver}
          >
            <div className="flex w-full flex-col gap-4 my-2 px-2" ref={scrollRef}>
              {data.length === 0 ? (
                <div
                  className="flex items-center rounded justify-center border h-56 bg-slate-100 font-bold text-2xl select-none text-slate-300 uppercase"
                >
                  <p className="mx-16">Drag & Drop a Suggestion or Add Your Own</p>
                </div>
              ) : (
                data.map((item, index) => (
                  <Planner
                    key={index}
                    index={index}
                    content={item.item}
                    onDelete={(index) => onDelete(index)}
                    onDateSelect={(date: string) => {item.date = date; if (invalidIndex === index) {setInvalidIndex(null)}}}
                    isLast={index === data.length - 1}
                    lastRef={lastItemRef}
                    invalid={invalidIndex === index ? true : false}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
