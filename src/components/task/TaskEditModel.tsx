import { ModalProps } from "@/components/modals";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskDraft } from "./TaskDraft";
import { FC } from "react";
import { format } from "date-fns";
import { RepeatRule } from "@prisma/client";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import { useState } from "react";
import { rRule } from "./TaskDraft";
import { Button } from "@/components/ui/button";
import { client } from "@/endpoints/client";
import { toast } from "sonner";
import { useEffect } from "react";

type TaskEditModelProps = ModalProps & {
    task: TaskDraft;
}

function timeStringToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  date.setFullYear(1970, 0, 1); 
  return date;
}

const REPEAT_ORDER: rRule[] = [
  "daily",
  "weekly",
  "monthly",
  "none",
];

export const TaskEditModel: FC<TaskEditModelProps> = ({ open, onOpenChange , task, setOpen}) => {
  const [localTask, setLocalTask] = useState<TaskDraft>(task);
  const [, setLoading] = useState(true);
  const [, setIsOpen] = useState(true);

  useEffect(() => {
    const fetch = async () => {
        try {
          const freshTask = await client.authed.getMyTaskById(task.id);
          setLocalTask(freshTask);
          setStartTime(freshTask.startAt ? format(new Date(freshTask.startAt), "HH:mm") : null);
          setEndTime(freshTask.finishAt ? format(new Date(freshTask.finishAt), "HH:mm") : null);
          setRepeatKey(freshTask.repeatKey ?? null);
        } catch (err) {
          toast.error("Failed to fetch task");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetch();
}, [task.id,open]);

  const [startTime, setStartTime] = useState<string | null>(() => {
    return localTask.startAt ? format(new Date(localTask.startAt), "HH:mm") : null;
  });
  const [endTime, setEndTime] = useState<string | null>(() => {
    return localTask.startAt ? format(new Date(localTask.startAt), "HH:mm") : null;
  });
  const [repeatKey, setRepeatKey] = useState<rRule | null>(localTask.repeatKey ?? null);

    const cycleRepeatKey = () => {
    const current = repeatKey ?? "none";
    const idx = REPEAT_ORDER.indexOf(current);
    const next = REPEAT_ORDER[(idx + 1) % REPEAT_ORDER.length];
    setRepeatKey(next === "none" ? null : next);
  };
   console.log(open);

  return (
    
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="text-sm">
          <strong>Repeat:</strong>{" "}
          <button
            type="button"
            onClick={cycleRepeatKey}
            className="ml-2 px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
            {repeatKey === null ? "None" : repeatKey.charAt(0).toUpperCase() + repeatKey.slice(1)}
          </button>
        </div>

        <div className="text-sm">
        <strong>Start Time:</strong>{" "}
        <TimePicker
          onChange={setStartTime}
          value={startTime}
          disableClock={true}
          clearIcon={null}
        />
        </div>

        <div className="text-sm">
        <strong>End Time:</strong>{" "}
        <TimePicker
          onChange={setEndTime}
          value={endTime}
          disableClock={true}
          clearIcon={null}
        />
        </div>
        <Button 
        type="button"
        onClick={async () => {
          const hasStart = !!startTime;
          const hasEnd = !!endTime;

          const startAt = hasStart ? timeStringToDate(startTime!) : undefined;
          const finishAt = hasEnd ? timeStringToDate(endTime!) : undefined;

          const timeValid = hasStart && hasEnd && finishAt!.getTime() >= startAt!.getTime();

          const data: {
            startAt?: Date;
            finishAt?: Date;
            repeatKey?: RepeatRule | null;
          } = {};

          if (timeValid) {
            data.startAt = startAt!;
            data.finishAt = finishAt!;
          }

          if (repeatKey === "none") {
            data.repeatKey = null;
          } else if (repeatKey != null) {
            data.repeatKey = repeatKey as RepeatRule;
          }

          const noChange = !data.startAt && !data.finishAt && !("repeatKey" in data);
          if (noChange) {
            onOpenChange(false);
            return;
          }

          try {
            await client.authed.UpdateMyTaskAdvanced(
              localTask.id,
              data.startAt,
              data.finishAt,
              data.repeatKey
            );
            toast.success("Task updated");
          } catch (err) {
            toast.error("Failed to update task");
            console.error(err);
          }

          onOpenChange(false);
          setIsOpen(false);
        }}>
          Save
        </Button>
      </DialogContent>
    </Dialog>
    )
};