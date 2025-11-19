import { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircleMore as MessageCircleMoreIcon,
  Sparkles as SparklesIcon,
  RefreshCw as RefreshCwIcon,
  X as XIcon,
  Send as SendIcon,
} from 'lucide-react';

export function ChatbotPanel() {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    setHover(false);
  }

  return (
    <div className="fixed bottom-10 right-5 flex">
      {open && (
        <Card className="w-[30rem] h-[36rem] bg-teal-800">
          <CardHeader>
            <CardTitle className="text-white">Edvance Chat</CardTitle>
            <CardDescription className="flex items-center text-white">
              <div className="animate-pulse rounded-full bg-green-200 h-2 w-2 mr-2"/>
              Typically replies in under a minute
            </CardDescription>
            <CardAction className="space-x-2">
              <Button className="cursor-pointer text-white" variant="ghost"><RefreshCwIcon /></Button>
              <Button className="cursor-pointer text-white" variant="ghost" onClick={close}><XIcon /></Button>
            </CardAction>
          </CardHeader>
          <CardContent className="bg-slate-50 h-full">
            <div className="flex flex-col items-center justify-center border-2 border-slate-100 rounded-xl bg-white my-4 border-dashed">
              <MessageCircleMoreIcon className="w-10 h-10 mt-2"/>
              <p className="font-bold">Start a conversation</p>
              <p className="text-center mx-2 mb-2">Ask for learning tips, feedback summaries, or help planning next steps.</p>
            </div>
          </CardContent>
          <CardFooter className="flex space-x-4 border-slate-200 min-h-1/5">
            <Textarea defaultValue={""} className="min-w-4/5 h-full bg-white"/>
            <Button
              variant="outline"
              size="icon"
              className="flex cursor-pointer rounded-full items-center justify-center"
            >
              <SendIcon />
            </Button>
          </CardFooter>
        </Card>
      )}
      {hover && !open && (
        <div className="flex bg-teal-800 rounded-full mr-2">
          <div className="flex flex-col items-center justify-center text-white h-16 mx-4">
            <div className="flex text-base font-bold">Ask Edvance</div>
            <div className="flex text-sm text-slate-50">Need quick study help?</div>
          </div>
          <div className="flex text-white items-center h-16 mx-4">
            <div className="animate-pulse rounded-full bg-green-200 h-2 w-2 mr-2"/>
            <div className="flex text-sm uppercase">Online</div>
          </div>
        </div>
      )}
      {!open &&(
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-16 w-16 border-6 cursor-pointer bg-teal-600 border-teal-800 hover:bg-teal-700"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => setOpen(true)}
        >
          <SparklesIcon className="min-h-8 min-w-8 text-white" />
        </Button>
      )}
    </div>
  );
};
