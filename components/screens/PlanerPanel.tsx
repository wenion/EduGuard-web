import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Item } from "@/components/ui/item";

import { Plus as PlusIcon, Check as CheckIcon } from "lucide-react";

export function PlanerPanel() {
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

          <ScrollArea className="h-60 rounded-md border flex mt-4">
            <div className="flex w-full max-w-md flex-col gap-4 mt-2 px-2">
                <Item variant="outline" className="flex items-center justify-between border h-56 bg-slate-300" >
                  <span>Your Action Plan Item</span>
                </Item>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
