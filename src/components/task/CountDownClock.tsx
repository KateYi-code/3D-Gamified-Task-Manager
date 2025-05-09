'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { GiAlarmClock } from "react-icons/gi";
import { FaPlay, FaPause, FaStop, FaCloudUploadAlt, FaVolumeUp, FaVolumeMute, FaMusic } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { addStory } from "@/lib/taskStories";

interface CountDownClockProps {
  initialMinutes?: number;
  initialSeconds?: number;
  onComplete?: () => void;
  size?: number;
}

const whiteNoiseList = [
  "/sounds/rain.mp3",
  "/sounds/ocean.mp3",
  "/sounds/forest.mp3",
];

export const CountDownClock = ({
  size = 200,
  initialMinutes = 25,
  initialSeconds = 0,
  onComplete,
}: CountDownClockProps) => {
  const router = useRouter();
  const totalInitialTime = initialMinutes * 60 + initialSeconds;
  const [timeLeft, setTimeLeft] = useState(totalInitialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usedTime, setUsedTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const stopAudio = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsAudioPlaying(false);
    }
  };

  const handleCompletion = useCallback(() => {
    setIsRunning(false);
    const formatted = formatTime(totalInitialTime);
    setUsedTime(totalInitialTime);
    toast(`🎉 Task completed! Total time used: ${formatted}`);
    addStory(totalInitialTime, formatted);
    stopAudio();
    onComplete?.();
    setShowModal(true);
  }, [totalInitialTime, onComplete]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, handleCompletion]);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [volume, audio]);

  const handlePause = () => setIsRunning(false);

  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
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
      } else {
        audio.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      playAudio(url);
    }
  };

  const handleRandomPlay = () => {
    const randomUrl = whiteNoiseList[Math.floor(Math.random() * whiteNoiseList.length)];
    playAudio(randomUrl);
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

  const percentage = timeLeft / totalInitialTime;

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div
          className="shadow-2xl rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-4 relative flex justify-center items-center"
          style={{ width: size, height: size }}
        >
          <div className="absolute z-10 flex flex-col items-center">
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

        <div className="flex gap-4">
          <Button onClick={() => setIsRunning(true)} variant="default" size="lg">
            <FaPlay className="mr-2" /> Start
          </Button>
          <Button onClick={handlePause} variant="secondary" size="lg">
            <FaPause className="mr-2" /> Pause
          </Button>
          <Button onClick={handleStop} variant="destructive" size="lg">
            <FaStop className="mr-2" /> Stop
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <div
            className="border-2 border-dashed border-gray-300 p-4 w-64 text-center rounded-lg"
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
              Drag & Drop MP3 file here or click to select file
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

          <div className="w-64 mt-4">
            <label className="flex items-center gap-2 text-sm mb-1">
              {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              Volume Control
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 Task Completed!</DialogTitle>
            <DialogDescription>
              You used <strong>{formatTime(usedTime)}</strong> for this session. Do you want to share your achievement to the community?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setShowModal(false)} variant="secondary">Cancel</Button>
            <Button
              onClick={() => {
                toast.success("✅ Shared to community!");
                setShowModal(false);
                router.push(`/taskcomplete?duration=${usedTime}`);
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
