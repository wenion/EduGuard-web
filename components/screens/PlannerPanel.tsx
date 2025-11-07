import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Item } from "@/components/ui/item";
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus as PlusIcon,
  Check as CheckIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  Save as SaveIcon,
} from "lucide-react";

import { DatePicker } from "@/components/date-picker";

type PlannerProps = {
  index: number;
  content: string;
  onDelete: (index: number) => void;
  isLast?: boolean;
  lastRef?: React.Ref<HTMLDivElement>;
};

function Planner({ index, content, onDelete, isLast, lastRef }: PlannerProps) {
  const [edit, setEdit] = useState(false);

  return (
    <Item
      variant="outline"
      className="flex items-center justify-between border h-fit"
      ref={isLast ? lastRef : undefined}
    >
      <div className="flex">
        {edit ? (
          <Textarea defaultValue={content}/>
        ) : (
          <span>{content}</span>
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
                <p>Save</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex flex-col">
            <DatePicker className="min-w-30" />
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

export function PlannerPanel() {
  const [data, setData] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null); // container reference
  const lastItemRef = useRef<HTMLDivElement>(null); // last added item reference

  const onDelete = (index: number) => {
    setData((prev) => prev.filter((_, i) => i !== index));
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newItem = e.dataTransfer.getData("text/plain");
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-medium">How about developing an action plan for improvement?</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">
            <em>Here, you can outline specific learning activities to support your improvement.</em>
          </CardDescription>

          <p className="text-base text-muted-foreground mt-2">
            <em>
              You can drag a suggestion from the previous panel and drop it here, edit it as needed, or create a new one. Be sure to set a target completion date to help track your progress.
            </em>
          </p>

          <div className="flex mt-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Plan Item</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
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
                <Item
                  variant="outline"
                  className="flex items-center justify-between border h-56 bg-slate-300"
                >
                  <span>Your Action Plan Item</span>
                </Item>
              ) : (
                data.map((item, index) => (
                  <Planner
                    key={index}
                    index={index}
                    content={item}
                    onDelete={(index) => onDelete(index)}
                    isLast={index === data.length - 1}
                    lastRef={lastItemRef}
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
