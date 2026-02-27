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
import { useScrollAreaTracking } from "@/context/useScrollAreaTracking";
import { useSwitchTracking } from "@/context/useSwitchTracking";
import { createActionPlanRequest } from "@/lib/authApi";

type PlannerProps = {
  id: string;
  index: number;
  content: string;
  onEdit: (index: number, content: string) => void;
  onDelete: (index: number) => void;
  onDateSelect: (date: string) => void;
  isLast?: boolean;
  lastRef?: React.Ref<HTMLLIElement>;
  invalid?: boolean;
};

function Planner({ id, index, content, onEdit, onDelete, onDateSelect, isLast, lastRef, invalid }: PlannerProps) {
  const [edit, setEdit] = useState(content.trim() === "" ? true : false);

  const onSave = () => {
    if (content.trim() === "") {
      onDelete(index);
      return;
    }
    setEdit(false)
  };

  return (
    <li
      className="flex items-center justify-between border rounded p-4 h-fit"
      ref={isLast ? lastRef : undefined}
      id={id}
    >
      <div className="flex w-full gap-2">
        {edit ? (
          <Textarea value={content} onChange={(e) => onEdit(index, e.target.value)} className="min-w-3/5"/>
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
                  onClick={onSave}
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
            <DatePicker onDateChanged={onDateSelect} className="" invalid={invalid} id={`date-actionPlanItem${index}`}/>
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
    </li>
  )
}

type PlannerPanelProps = {
  onAddPlanner: (data: {item: string, date: string}[]) => void,
  className?: string
};

export function PlannerPanel({onAddPlanner, className}: PlannerPanelProps) {
  const { authorizedFetch, selectedUnitId } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<{item: string, date: string}[]>([]);
  const [invalidIndex, setInvalidIndex] = useState<number | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  const { logSelectTrace } = useSwitchTracking();

  const items = [
    {title:"S", value: "Make tasks Specific by clearly defining the action and outcome (e.g., “Summarize key points from Week 4 lecture”)."},
    {title:"M", value: "Ensure tasks are Measurable by including criteria to track completion (e.g., “Write a 1-page summary”)."},
    {title:"A", value: "Confirm tasks are Achievable by choosing steps you can realistically complete within the time available."},
    {title:"R", value: "Set Relevant goals that directly support your broader academic or personal objectives."},
    {title:"T", value: "Assign a Time-bound deadline to each task to stay accountable (e.g., “Complete by Friday at 6 PM”)."}
  ]

  const scrollRef = useRef<HTMLUListElement>(null); // container reference
  const lastItemRef = useRef<HTMLLIElement>(null); // last added item reference

  const onDelete = (index: number) => {
    setData((prev) => prev.filter((_, i) => i !== index));
  }

  const onSave = () => {
    if (data.length === 0) {
      setAlert("No action plan item to save!");
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      return;
    }
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item.item === "") {
        setAlert("You have unsaved action plan item(s)!");

        setTimeout(() => {
          setAlert(null);
        }, 3000);
        return;
      }
      if (!item.date) {
        setInvalidIndex(i);
        setAlert("Please specify an intended completion date for the action plan item!");

        const row = document.getElementById(`planner-item-${i}`);
        row?.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
          setAlert(null);
        }, 3000);
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

  const onUpdate = (index: number, content: string) => {
    const newData = [...data];
    newData[index].item = content;
    setData(newData);
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const json = e.dataTransfer?.getData("application/json");
    if (json) {
      const parsed = JSON.parse(json);
      const newItem = {item: parsed.text, date: ""};
      setData((prev) => [...prev, newItem]);

      logSelectTrace({
        type: "drop",
        text: null,
        tag: "LI",
        id: parsed.id,
        className: null,
        feedback_set_index: parsed.index,
        data: null,
        original_item_id: parsed.id
      });

      setTimeout(() => {
        if (lastItemRef.current) {
          lastItemRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 0);
    }
  };

  const onNew = () => {
    setData((prev) => [...prev, {item: "", date: ""}]);
    setTimeout(() => {
      if (lastItemRef.current) {
        lastItemRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 0);
  }

  const handleDragOver = (e: React.DragEvent) => {
    // Allow drop
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  useScrollAreaTracking(scrollAreaRef);

  return (
    <div className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-thin uppercase">Action planning</CardTitle>
          <CardDescription className="text-lg font-semibold text-black">
            <h2 id="actionPlanHeading">How about developing an action plan for improvement?</h2>
          </CardDescription>
          <CardAction className="justify-self-center self-center">
            <SquareKanbanIcon />
          </CardAction>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="py-2">Set Your Learning Goals</Badge>
          <CardDescription className="text-lg font-normal text-black font-sans italic pt-2" attr-class="main-text">
            Outline specific learning activities to support your improvement.
          </CardDescription>

          <ul className="text-base text-muted-foreground mt-2 space-y-2" attr-class="insight-guidelines">
            {items.map((item, index) => (
              <li key={index}>
                <b>{item.title}</b>{": "}
                {item.value}
              </li>)
            )}
          </ul>

          <Separator className="my-4" />

          <div className="flex justify-end my-4 gap-4">
            <Button
              id="add-action-item-btn"
              title="Add an Action Plan Item"
              variant="outline"
              size="sm"
              className="flex items-center gap-2 cursor-pointer"
              onClick={onNew}
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Plan Item</span>
            </Button>
            <Button
              id="save-action-plan-btn"
              title="Save the Action Plan"
              variant="outline"
              size="sm"
              className="flex items-center gap-2 cursor-pointer"
              onClick={onSave}
            >
              <CheckIcon className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </div>
          {alert && (
            <div className="text-red-600 font-semibold mb-4">
              <p id="save-message" attr-class="d-none" role="status" aria-live="polite">{alert}</p>
            </div>
          )}

          <ScrollArea
            ref={scrollAreaRef}
            className="h-80 rounded-md border flex mt-4"
            onDrop={(e) => handleDrop(e)}
            onDragOver={handleDragOver}
            attr-class="ul-container action-plan-container"
          >
            <ul className="flex w-full flex-col gap-4 my-2 px-2" ref={scrollRef} id="action-plan-list" attr-class="list-group">
              {data.length === 0 ? (
                <div
                  className="flex items-center rounded justify-center border h-76 bg-slate-100 font-bold text-2xl select-none text-slate-300 uppercase"
                >
                  <p className="mx-16">Drag & Drop a Suggestion or Add Your Own</p>
                </div>
              ) : (
                data.map((item, index) => (
                  <Planner
                    id={`actionPlanItem${index}`}
                    key={index}
                    index={index}
                    content={item.item}
                    onEdit={(index, content) => onUpdate(index, content)}
                    onDelete={(index) => onDelete(index)}
                    onDateSelect={(date: string) => {
                      item.date = date;
                      logSelectTrace({
                        type: 'select date for action',
                        text: date,
                        tag: "INPUT",
                        id: `actionPlanItemDate${index}`,
                        className: "date-picker",
                      });
                      if (invalidIndex === index) {
                        setInvalidIndex(null)
                      }
                    }}
                    isLast={index === data.length - 1}
                    lastRef={lastItemRef}
                    invalid={invalidIndex === index ? true : false}
                  />
                ))
              )}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
