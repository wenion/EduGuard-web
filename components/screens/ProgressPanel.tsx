import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

import {
  ChevronsRight as ChevronsRightIcon,
  CircleCheckBig as CircleCheckBigIcon,
  Rows4 as Rows4Icon
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { fetchActionPlanRequest } from "@/lib/authApi";
import { ActionPlanResponse } from "@/types/ActionPlan";
import { ScrollArea } from "../ui/scroll-area";

export function ProgressPanel() {
  const { authorizedFetch } = useAuth();
  const [data, setData] = useState<ActionPlanResponse>({ action_plan: [] });

  const load = async () => {
    try {
      const res = await fetchActionPlanRequest(authorizedFetch, 4);
      setData(res);
    } catch (e: any) {
      console.error("Failed to load action plan data:", e);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

          <div className="flex justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronsRightIcon className="h-4 w-4" />
              <span>In-progress items only</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <CircleCheckBigIcon className="h-4 w-4" />
              <span>Completed items only</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Rows4Icon className="h-4 w-4" />
              <span>All items</span>
            </Button>
          </div>

          <ScrollArea className="h-[48rem] rounded-md border flex mt-4">
            <div className="flex w-full max-w-md flex-col gap-4 mt-2 px-2">
              {data.action_plan.map(action => (
                <Item key={action.id} variant="outline">
                  <ItemContent>
                    <ItemTitle>{action.action_content}</ItemTitle>
                    <ItemDescription>
                      <em>To be completed by: {action.target_completion_date}</em>
                    </ItemDescription>
                    <ItemDescription>
                      <em>Status: {action.status} (updated on: {(new Date(action.marked_status_time * 1000)).toLocaleDateString()})</em>
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
