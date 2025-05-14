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
import { useModal } from "@/components/modals";
import { addStory } from "@/lib/taskStories";
import { Slider } from "@/components/ui/slider";
import { NotificationManager, MAX_BACKGROUND_TIME, WARNING_INTERVAL } from "@/lib/notifications";
import { cn } from "@/lib/utils";

interface CountDownClockProps {
  initialMinutes?: number;
  initialSeconds?: number;
  onComplete?: () => void;
  taskId: string;
}

const whiteNoiseList = ["/sounds/rain.mp3", "/sounds/ocean.mp3", "/sounds/forest.mp3"];

export const CountDownClock = ({
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
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { openModal: openPostModal, modal: postModal } = useModal("CreatePostModal");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveTimeRef = useRef<number>(Date.now());
  const notificationManager = useRef(NotificationManager.getInstance());

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
    if (timeLeft > 0) {
      setShowConfirmModal(true);
    } else {
      handleTaskComplete();
    }
  };

  const handleTaskComplete = () => {
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

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      lastActiveTimeRef.current = Date.now();
      if (isRunning) {
        notificationManager.current.sendNotification("Task in Progress", {
          body: "Please return to the page to continue your task! Or your task will fail in 1 minute.",
        });

        backgroundTimerRef.current = setInterval(() => {
          const currentTime = Date.now();
          const timeInBackground = Math.floor((currentTime - lastActiveTimeRef.current) / 1000);

          if (timeInBackground >= MAX_BACKGROUND_TIME) {
            clearInterval(backgroundTimerRef.current!);
            handleTaskFailure();
          } else if (timeInBackground % WARNING_INTERVAL === 0) {
            notificationManager.current.sendWarningNotification(timeInBackground);
          }
        }, 1000);
      }
    } else {
      if (backgroundTimerRef.current) {
        clearInterval(backgroundTimerRef.current);
        notificationManager.current.resetWarningTimer();
      }
    }
  }, [isRunning]);

  const handleTaskFailure = () => {
    clearTimer();
    setIsRunning(false);
    stopAudio();
    toast.error("Task Failed: Away for too long");
    notificationManager.current.sendNotification("Task Failed", {
      body: "Task has been terminated due to extended absence",
    });
  };

  const handleStart = async () => {
    if (!notificationManager.current.hasNotificationPermission()) {
      const granted = await notificationManager.current.requestPermission();
      if (!granted) {
        toast.error("Please approve notification permission");
        // return;
      }
    }
    setIsRunning(true);
  };

  useEffect(() => {
    const init = async () => {
      await handleStart();
    };
    init();
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (backgroundTimerRef.current) {
        clearInterval(backgroundTimerRef.current);
      }
    };
  }, [handleVisibilityChange]);

  return (
    <>
      {postModal}
      <div className="flex flex-col items-center gap-4">
        {/* Timer Circle */}
        <div className="shadow-2xl rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-2 sm:p-3 md:p-4 relative flex justify-center items-center w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px]">
          <div className="absolute z-10 flex flex-col items-center text-white font-semibold">
            <GiAlarmClock className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
            <br />
            <div className="font-bold text-2xl sm:text-2xl md:text-3xl">{formatTime(timeLeft)}</div>
          </div>
          <CircularProgressbar
            styles={buildStyles({
              pathColor: "#4fe7e7",
              trailColor: "#ffffff",
              strokeLinecap: "round",
              pathTransition: "stroke-dashoffset 0.5s ease 0s",
            })}
            value={1 - percentage}
            maxValue={1}
            className="z-0"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 mt-2">
          <Button
            onClick={handleStart}
            variant="default"
            size="lg"
            className={cn(
              "transition-transform duration-100",
              buttonPressed === "start" && "scale-95",
            )}
            onMouseDown={() => setButtonPressed("start")}
            onMouseUp={() => setButtonPressed(null)}
            onMouseLeave={() => setButtonPressed(null)}
          >
            <FaPlay className="mr-2" /> Start
          </Button>
          <Button
            onClick={() => setIsRunning(false)}
            variant="secondary"
            size="lg"
            className={cn(
              "transition-transform duration-100",
              buttonPressed === "pause" && "scale-95",
            )}
            onMouseDown={() => setButtonPressed("pause")}
            onMouseUp={() => setButtonPressed(null)}
            onMouseLeave={() => setButtonPressed(null)}
          >
            <FaPause className="mr-2" /> Pause
          </Button>
          <Button
            onClick={handleStop}
            variant="destructive"
            size="lg"
            className={cn(
              "transition-transform duration-100",
              buttonPressed === "stop" && "scale-95",
            )}
            onMouseDown={() => setButtonPressed("stop")}
            onMouseUp={() => setButtonPressed(null)}
            onMouseLeave={() => setButtonPressed(null)}
          >
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-500">
              ⚠️ Task Not Completed
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p className="text-gray-700">
                You still have{" "}
                <span className="font-semibold text-orange-500">{formatTime(timeLeft)}</span> left
                in your session.
              </p>
              <p className="text-sm text-gray-500">
                Are you sure you want to end this session early?
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button
              onClick={() => {
                setShowConfirmModal(false);
                handleTaskComplete();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Yes, End Session Now
            </Button>
            <Button onClick={() => setShowConfirmModal(false)} variant="secondary">
              No, Continue Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-purple-600">
              🎉Task Completed!
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p className="text-gray-700">
                You&apos;ve just finished a session with{" "}
                <span className="font-semibold text-blue-500">{formatTime(usedTime)}</span> of deep
                work.
              </p>
              <p className="text-sm text-gray-500">
                Your achievement has been shared to the community. Keep it up!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={() => {
                  setShowModal(false);
                  router.push("/");
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => {
                  setShowModal(false);
                  router.push("/tasklog");
                }}
                variant="secondary"
              >
                View Task Log
              </Button>
            </div>
            <Button
              onClick={() => {
                if (taskId) {
                  setShowModal(false);

                  router.push(`/planet?finished=${taskId}`);
                } else {
                  toast.error("Missing task ID");
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Share and Add Bonus Item to My Planet
            </Button>
            <button
              onClick={() => {
                if (taskId) {
                  openPostModal({});
                } else {
                  alert("Missing task ID");
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 transition-all"
            >
              Share the Achievement
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
