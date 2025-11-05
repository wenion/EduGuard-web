import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus as PlusIcon, Check as CheckIcon } from "lucide-react";

export function PlanerPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-medium">How about developing an action plan for improvement?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">Here, you can outline specific learning activities to support your improvement.</p>

          <p className="text-sm text-muted-foreground mb-2">
            You can drag a suggestion from the previous panel and drop it here, edit it as needed, or create a new one. Be sure to set a target completion date to help track your progress.
          </p>
          <div className="flex justify-end">
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
        </CardContent>
      </Card>
    </div>
  );
}
