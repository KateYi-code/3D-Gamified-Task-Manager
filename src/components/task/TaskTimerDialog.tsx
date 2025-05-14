"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import "./TaskTimerDialog.css";

type Props = {
  taskId: string;
};

export const TaskTimerDialog = ({ taskId }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const presetStart = searchParams.get("start");
  const presetEnd = searchParams.get("end");

  const [startDate, setStartDate] = useState<Date | undefined>(
    presetStart ? new Date(presetStart) : new Date(),
  );
  const [startTime, setStartTime] = useState<Date | undefined>(
    presetStart ? new Date(presetStart) : new Date(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    presetEnd ? new Date(presetEnd) : undefined,
  );
  const [endTime, setEndTime] = useState<Date | undefined>(
    presetEnd ? new Date(presetEnd) : undefined,
  );

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
  };

  const handleStartTimeSelect = (time: string | null) => {
    if (!time) return;
    setStartTime(new Date(time));
  };

  const handleEndTimeSelect = (time: string | null) => {
    if (!time) return;
    setEndTime(new Date(time));
  };

  const handleConfirm = () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Please select both start and end times.");
      return;
    }

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime.getHours());
    startDateTime.setMinutes(startTime.getMinutes());
    startDateTime.setSeconds(startTime.getSeconds());

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endTime.getHours());
    endDateTime.setMinutes(endTime.getMinutes());
    endDateTime.setSeconds(endTime.getSeconds());

    if (startDateTime >= endDateTime) {
      toast.error("End time must be later than start time.");
      return;
    }

    const startISO = startDateTime.toISOString();
    const endISO = endDateTime.toISOString();
    const url = `/countdownclock/${taskId}?start=${startISO}&end=${endISO}`;

    console.log("✅ Redirecting to:", url);
    router.push(url);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Select Task Time</h2>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium mb-1">Start Date</p>
          <Calendar mode="single" selected={startDate} onSelect={handleStartDateSelect} />
          {startDate && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {format(startDate, "PP")}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Start Time</p>
          <TimePicker
            className="custom-time-picker"
            onChange={handleStartTimeSelect}
            value={startTime}
            format="HH:mm:ss"
            disableClock
            clearIcon={null}
          />
          {startTime && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {format(startTime, "pp")}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-1">End Date</p>
          <Calendar mode="single" selected={endDate} onSelect={handleEndDateSelect} />
          {endDate && (
            <p className="text-sm text-muted-foreground mt-1">Selected: {format(endDate, "PP")}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-1">End Time</p>
          <TimePicker
            className="custom-time-picker"
            onChange={handleEndTimeSelect}
            value={endTime}
            format="HH:mm:ss"
            disableClock
            clearIcon={null}
          />
          {endTime && (
            <p className="text-sm text-muted-foreground mt-1">Selected: {format(endTime, "pp")}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          disabled={!startDate || !startTime || !endDate || !endTime}
          onClick={handleConfirm}
          className="flex-1"
        >
          Start Task
        </Button>
      </div>
    </div>
  );
};
