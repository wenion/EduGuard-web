import { useState, useRef, useEffect } from 'react';

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

import { sendChat } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";

export function ChatbotPanel() {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { selectedUnitId, authorizedFetch, sessionID, setSessionID } = useAuth();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sessionID) {
      setSessionID(generateSessionId(8));
    }
  }, [sessionID]);

  const [chatlist, setChatlist] = useState<Array<{role: string; content: string, timestamp: string}>>([]);

  const close = () => {
    setOpen(false);
    setHover(false);
  }

  const refresh = () => {
    setSessionID(generateSessionId(8));
    setChatlist([]);
  }

  const generateSessionId = (length: number) =>  {
    // length here is the number of bytes. For a 16-character hex string, use 8 bytes.
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16).padStart(2, '0')).join('');
  }

  const send = async () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!textareaRef.current || !bottomRef.current || !sessionID) {
      return;
    }

    const textarea = textareaRef.current;
    const userMessage = textarea.value;
    if (userMessage.trim() === '') {
      return;
    }

    setChatlist((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp },
    ]);
    setLoading(true);
    textareaRef.current.disabled = true;
    bottomRef.current.disabled = true;
    textarea.value = '';

    if (!selectedUnitId) {
      const systemMessage = "To assist you as best as possible, please select a unit before starting the conversation.";
      setChatlist((prev) => [
        ...prev,
        { role: "system", content: systemMessage, timestamp },
      ]);

      setLoading(false);
      textareaRef.current.disabled = false;
      bottomRef.current.disabled = false;
      return;
    }

    const res = await sendChat(authorizedFetch, userMessage, selectedUnitId, sessionID);
    setChatlist((prev) => [
      ...prev,
      { role: "assistant", content: res.message, timestamp: res.timestamp },
    ]);

    setLoading(false);
    textareaRef.current.disabled = false;
    bottomRef.current.disabled = false;
  }

  const onEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      send();
    }
  }

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatlist]);

  return (
    <div className="fixed bottom-10 right-5 flex">
      {open && (
        <Card className="w-[30rem] h-[36rem] min-w-96 min-h-100 max-w-[90vw] max-h-[90vh] resize overflow-hidden bg-teal-800" id="chatWindow" role="dialog" aria-modal="false" aria-label="Edvance chat assistant">
          <CardHeader>
            <CardTitle className="text-white">Edvance Chat</CardTitle>
            <CardDescription className="flex items-center text-white">
              <div className="animate-pulse rounded-full bg-green-200 h-2 w-2 mr-2"/>
              Typically replies in under a minute
            </CardDescription>
            <CardAction className="space-x-2">
              <Button
                id="newChat"
                aria-label="Start a new chat"
                className="cursor-pointer text-white"
                variant="ghost"
                onClick={refresh}
              >
                <RefreshCwIcon />
              </Button>
              <Button
                id="closeChat"
                aria-label="Close chat"
                className="cursor-pointer text-white"
                variant="ghost"
                onClick={close}
              >
                <XIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="bg-slate-50 flex-1 min-h-0 px-2">
            {chatlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center border-2 border-slate-100 rounded-xl bg-white my-4 border-dashed" id="chatEmptyState">
                <MessageCircleMoreIcon className="w-10 h-10 mt-2"/>
                <p className="font-bold" attr-class="empty-title">Start a conversation</p>
                <p className="text-center mx-2 mb-2" attr-class="empty-copy">Ask for learning tips, feedback summaries, or help planning next steps.</p>
              </div>
            ) : (
              <div
                className="flex flex-col overflow-x-hidden overflow-y-auto h-full"
                ref={contentRef}
              >
                {chatlist.map((chat, index) => (
                  <div
                    key={index}
                    className={`w-fit py-2 px-4 my-1 rounded space-x-2  ${
                      chat.role === 'user' ?
                      'bg-teal-800 text-white self-end max-w-[80%]' : 'bg-slate-300 self-start shadow-xl max-w-[80%]'}`}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: chat.content }}
                    />
                    <p className="text-xs text-left">{chat.timestamp}</p>
                  </div>
                ))}
                {loading && <div>Loading...</div>}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex space-x-4 border-slate-200 min-h-1/5">
            <label htmlFor="chatTextarea" className="sr-only">Message Edvance</label>
            <Textarea
              id="chatTextarea"
              placeholder="Ask anything about your course"
              className="min-w-4/5 h-full bg-white"
              ref={textareaRef}
              onKeyDown={onEnter}
            />
            <Button
              id="sendButton"
              aria-label="Send chat message"
              variant="outline"
              size="icon"
              className="flex cursor-pointer rounded-full items-center justify-center"
              ref={bottomRef}
              onClick={send}
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
