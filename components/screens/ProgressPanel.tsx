import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ChevronsRight as ChevronsRightIcon,
  CircleCheckBig as CircleCheckBigIcon,
  Rows4 as Rows4Icon,
  Trash2 as TrashIcon
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { fetchActionPlanRequest, finaliseAction } from "@/lib/authApi";
import { ActionPlanItem, ActionPlanResponse } from "@/types/ActionPlan";

type FilterType = "all" | "completed" | "none";

type ProgressCardProps = {
  action: ActionPlanItem;
  onCompleted: (id: number, action:string, marked_status_time: number) => void
  onDeteled: (id: number, action:string, marked_status_time: number) => void
};

function ProgressCard({ action, onCompleted, onDeteled }: ProgressCardProps) {
  const { authorizedFetch } = useAuth();
  const [completedText, setCompletedText] = useState("Completed timely!");
  const [completedLateText, setCompletedLateText] = useState("Completed late.");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedClick = (id: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setCompletedText("Completed timely!");
    }
    else {
      let timeLeft = 5;
      setCompletedText(`Undo (${timeLeft}s)`);

      intervalRef.current = setInterval(async() => {
        timeLeft--;
        setCompletedText(`Undo (${timeLeft}s)`);
        if (timeLeft <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          try {
            const res = await finaliseAction(authorizedFetch, id, "Completed timely!");
            onCompleted(id, "Completed timely!", res.marked_status_time)
            setCompletedText("Completed timely!");
          } catch (e: any) {
            console.error("finaliseAction Error");
          }
        }
      }, 1000);
    }
  }
  
  const intervalRef2 = useRef<NodeJS.Timeout | null>(null);
  const completedLateClick = (id: number) => {
    if (intervalRef2.current) {
      clearInterval(intervalRef2.current);
      intervalRef2.current = null;
      setCompletedLateText("Completed late.");
    }
    else {
      let timeLeft = 5;
      setCompletedLateText(`Undo (${timeLeft}s)`);

      intervalRef2.current = setInterval(async() => {
        timeLeft--;
        setCompletedLateText(`Undo (${timeLeft}s)`);
        if (timeLeft <= 0) {
          if (intervalRef2.current) {
            clearInterval(intervalRef2.current);
            intervalRef2.current = null;
          }
          try {
            const res = await finaliseAction(authorizedFetch, id, "Completed late.");
            onCompleted(id, "Completed late.", res.marked_status_time)
            setCompletedLateText("Completed late.");
          } catch (e: any) {
            console.error("finaliseAction Error");
          }
        }
      }, 1000);
    }
  }

  const deleteClick = async (id: number) => {
    try {
      const res = await finaliseAction(authorizedFetch, id, "deleted");
      onDeteled(id, "delete", res.marked_status_time);
    } catch (e: any) {
      console.error("deleteAction Error");
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (intervalRef2.current) {
        clearInterval(intervalRef2.current);
      }
    };
  }, []);

  return (
    <Item
      key={action.id}
      variant="outline"
      className={[
        action.status === "Completed timely!" ? "bg-green-50" :
          action.status === "Completed late." ? "bg-slate-50" : ""
      ].join(" ")}
    >
      <ItemContent>
        {!action.status ? (
          <div className="flex">
            <ItemTitle>{action.action_content}</ItemTitle>
            <div className="flex flex-col items-center justify-center gap-2 min-w-40">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-green-50 border cursor-pointer"
                disabled={intervalRef2.current !== null}
                onClick={()=> {completedClick(action.id)}}
              >
                <span>{completedText}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 cursor-pointer"
                disabled={intervalRef.current !== null}
                onClick={() => completedLateClick(action.id)}
              >
                <span>{completedLateText}</span>
              </Button>
            </div>
            <div className="absoluted mr-[-10px] mt-[-10px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer rounded-full"
                    onDoubleClick={() => deleteClick(action.id)}
                  >
                    <TrashIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Double click to delete.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        ): (
          <>
            <ItemTitle>{action.action_content}</ItemTitle>
            <ItemDescription>
              <em>To be completed by: {action.target_completion_date}</em>
            </ItemDescription>
            <ItemDescription>
              <em>Status: {action.status} (updated on: {(new Date(action.marked_status_time * 1000)).toLocaleDateString()})</em>
            </ItemDescription>
          </>
        )}
      </ItemContent>
    </Item>
  )
}

export function ProgressPanel({ plannerData }: {plannerData: ActionPlanResponse}) {
  const [data, setData] = useState<ActionPlanResponse>({ action_plan: [] });
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    setData(plannerData);
  }, [plannerData]);

  const filteredData = useMemo(() => {
    switch (filter) {
      case "completed":
        return data.action_plan.filter(
          (item) => item.status === "Completed timely!" || item.status === "Completed late."
        );
      case "none":
        return data.action_plan.filter((item) => item.status === null);
      default:
        // all
        return data.action_plan;
    }
  }, [data.action_plan, filter]);

  const updateData = (id: number, action:string, marked_status_time: number) => {
    setData((prev) => {
      const updated = prev.action_plan.map((item) =>
        item.id === id
          ? { ...item, status: action, marked_status_time }
          : item
      );
      return { ...prev, action_plan: updated };
    });
  }

  const onDetele = (id: number, action:string, marked_status_time: number) => {
    setData((prev) => {
      const filtered = prev.action_plan.filter((item) => item.id !== id);
      return { ...prev, action_plan: filtered };
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-medium">How are you progressing with your plan?</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">
            <em>Here, you can track your progress in carrying out the action plan.</em>
          </CardDescription>

          <p className="text-base text-muted-foreground mt-2">
            <em>
              Mark your completed action item to keep track of your progress:
            </em>
          </p>

          <div className="flex justify-end my-4 gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 cursor-pointer"
              onClick={()=> setFilter("none")}
            >
              <ChevronsRightIcon className="h-4 w-4" />
              <span>In-progress items only</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 cursor-pointer"
              onClick={()=> setFilter("completed")}
            >
              <CircleCheckBigIcon className="h-4 w-4" />
              <span>Completed items only</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 cursor-pointer"
              onClick={()=> setFilter("all")}
            >
              <Rows4Icon className="h-4 w-4" />
              <span>All items</span>
            </Button>
          </div>

          <ScrollArea className="h-[44rem] rounded-md border flex mt-4">
            <div className="flex w-full flex-col gap-4 mt-2 px-2">
              {filteredData.map(action => (
                <ProgressCard
                  key={action.id}
                  action={action}
                  onCompleted={updateData}
                  onDeteled={onDetele}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
