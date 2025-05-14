"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { GiAlarmClock } from "react-icons/gi";
import {
  FaCloudUploadAlt,
  FaMusic,
  FaPause,
  FaPlay,
  FaStop,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addStory } from "@/lib/taskStories";
import { Slider } from "@/components/ui/slider";

interface CountDownClockProps {
  initialMinutes?: number;
  initialSeconds?: number;
  onComplete?: () => void;
  size?: number;
  taskId: string;
}

const whiteNoiseList = ["/sounds/rain.mp3", "/sounds/ocean.mp3", "/sounds/forest.mp3"];

export const CountDownClock = ({
  size = 200,
  initialMinutes = 25,
  initialSeconds = 0,
  onComplete,
  taskId,
}: CountDownClockProps) => {
  const router = useRouter();
  const totalInitialTime = initialMinutes * 60 + initialSeconds;
  const [timeLeft, setTimeLeft] = useState(totalInitialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [usedTime, setUsedTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (time: number) =>
    `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const stopAudio = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsAudioPlaying(false);
    }
  }, [audio]);

  const handleCompletion = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setUsedTime(totalInitialTime);
    const formatted = formatTime(totalInitialTime);
    toast(`🎉 Task completed! Total time used: ${formatted}`);
    addStory(totalInitialTime, formatted);
    stopAudio();
    onComplete?.();
    setShowModal(true);
  }, [totalInitialTime, onComplete, stopAudio]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            handleCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [isRunning, handleCompletion]);

  useEffect(() => {
    if (audio) audio.volume = volume;
  }, [volume, audio]);

  const handleStop = () => {
    clearTimer();
    setIsRunning(false);
    const used = totalInitialTime - timeLeft;
    const formatted = formatTime(used);
    setUsedTime(used);
    toast(`🎉 Task completed! Total time used: ${formatted}`);
    addStory(used, formatted);
    stopAudio();
    setShowModal(true);
  };

  const toggleAudio = () => {
    if (audio) {
      if (isAudioPlaying) {
        audio.pause();
        audio.currentTime = 0;
      } else {
        audio.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const playAudio = (url: string) => {
    stopAudio();
    const newAudio = new Audio(url);
    newAudio.loop = true;
    newAudio.volume = volume;
    newAudio.play();
    setAudio(newAudio);
    setIsAudioPlaying(true);
  };

  const handleRandomPlay = () => {
    const randomUrl = whiteNoiseList[Math.floor(Math.random() * whiteNoiseList.length)];
    playAudio(randomUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      playAudio(url);
    }
  };

  const percentage = timeLeft / totalInitialTime;

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {/* Timer Circle */}
        <div
          className="shadow-2xl rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-4 relative flex justify-center items-center"
          style={{ width: size, height: size }}
        >
          <div className="absolute z-10 flex flex-col items-center text-white font-semibold">
            <GiAlarmClock size={36} />
            <div>{formatTime(timeLeft)}</div>
          </div>
          <CircularProgressbar
            styles={buildStyles({
              pathColor: "#00ffff",
              trailColor: "#4b5563",
              strokeLinecap: "butt",
            })}
            value={percentage}
            maxValue={1}
            className="z-0"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 mt-2">
          <Button onClick={() => setIsRunning(true)} variant="default" size="lg">
            <FaPlay className="mr-2" /> Start
          </Button>
          <Button onClick={() => setIsRunning(false)} variant="secondary" size="lg">
            <FaPause className="mr-2" /> Pause
          </Button>
          <Button onClick={handleStop} variant="destructive" size="lg">
            <FaStop className="mr-2" /> Stop
          </Button>
        </div>

        {/* Audio Upload + White Noise */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <div
            className="border-2 border-dashed border-gray-300 p-4 w-64 text-center rounded-lg cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const url = URL.createObjectURL(file);
                playAudio(url);
              }
            }}
          >
            <FaCloudUploadAlt className="mx-auto text-4xl text-gray-500" />
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="cursor-pointer text-sm text-gray-500">
              Drag & drop or click to upload audio
            </label>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleRandomPlay} variant="secondary">
              <FaMusic className="mr-2" /> Random White Noise
            </Button>
            <Button onClick={toggleAudio} variant="outline">
              {isAudioPlaying ? (
                <>
                  <FaPause className="mr-2" /> Pause Music
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" /> Play Music
                </>
              )}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="w-64 mt-4">
            <label className="flex items-center gap-2 text-sm mb-1">
              {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              Volume
            </label>
            <Slider
              min={0}
              step={0.01}
              max={1}
              value={[volume]}
              onValueChange={(e) => setVolume(e[0])}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 Task Completed!</DialogTitle>
            <DialogDescription>
              You used <strong>{formatTime(usedTime)}</strong>. Share it with the community?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setShowModal(false)} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("✅ Shared!");
                setShowModal(false);
                router.push(`/taskcomplete?duration=${usedTime}&taskId=${taskId}`);
              }}
            >
              Share Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
