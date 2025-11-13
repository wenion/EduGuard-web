"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  onDateChanged: (date: string) => void;
  className?: string;
  id?: string;            // (A) allow an id on the button trigger
  invalid?: boolean;      // (B) when true, we add .blink
};

export function DatePicker({ onDateChanged, className, id, invalid } : DatePickerProps) {
  const [date, setDate] = React.useState<Date>()

  React.useEffect(() => {
    if (date) {
      let dd = String(date.getDate()).padStart(2, '0');
      let mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
      let yyyy = date.getFullYear();

      let formattedDate = yyyy + '-' + mm + '-' + dd;
      onDateChanged(formattedDate);
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={[
            "data-[empty=true]:text-muted-foreground justify-start text-left font-normal",
            invalid ? " border-2 border-red-500" : "",
            className
          ].join(" ")}
        >
          <CalendarIcon />
          {date ? format(date, "dd/MM/yyyy") : <span>dd/MM/yyyy</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}
