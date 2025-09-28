"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void
}

export function DateRangePicker({ onDateRangeChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [preset, setPreset] = useState("this-month")

  const handlePresetChange = (value: string) => {
    setPreset(value)
    const now = new Date()
    let newStartDate: Date
    let newEndDate: Date = now

    switch (value) {
      case "this-week":
        newStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        break
      case "this-month":
        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "last-month":
        newStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        newEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case "this-quarter":
        const quarter = Math.floor(now.getMonth() / 3)
        newStartDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case "this-year":
        newStartDate = new Date(now.getFullYear(), 0, 1)
        break
      case "last-year":
        newStartDate = new Date(now.getFullYear() - 1, 0, 1)
        newEndDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      default:
        return
    }

    setStartDate(newStartDate)
    setEndDate(newEndDate)
    onDateRangeChange(newStartDate, newEndDate)
  }

  const handleCustomDateChange = (start: Date, end: Date) => {
    setStartDate(start)
    setEndDate(end)
    setPreset("custom")
    onDateRangeChange(start, end)
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this-week">This Week</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="this-quarter">This Quarter</SelectItem>
          <SelectItem value="this-year">This Year</SelectItem>
          <SelectItem value="last-year">Last Year</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(startDate, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && handleCustomDateChange(date, endDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(endDate, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && handleCustomDateChange(startDate, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  )
}
