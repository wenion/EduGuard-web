import { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';

export function ChatbotPanel() {
  const [hover, setHover] = useState(false);

  return (
    <div className="fixed bottom-10 right-10 flex">
      {hover && (
        <div className="flex bg-teal-800 rounded-full mr-2">
          <div className="flex flex-col items-center justify-center text-white h-16 mx-4">
            <div className="flex text-base font-bold">Ask Edvance</div>
            <div className="flex text-sm text-slate-50">Need quick study help?</div>
          </div>
          <div className="flex text-white items-center h-16 mx-4">
            <div className="animate-pulse rounded-full bg-green-200 h-2 w-2 mr-2"></div>
            <div className="flex text-sm uppercase">Online</div>
          </div>
        </div>
      )}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-16 w-16 border-6 cursor-pointer bg-teal-600 border-teal-800 hover:bg-teal-700"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Sparkles className="min-h-8 min-w-8 text-white" />
      </Button>
    </div>
  );
};
