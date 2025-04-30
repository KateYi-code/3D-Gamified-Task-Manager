import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { GiAlarmClock } from "react-icons/gi";

interface CountDownClockProps {
  initialMinutes?: number;
  initialSeconds?: number;
  onComplete?: () => void;
  size?: number;
}

const value = 0.66;

export const CountDownClock = ({ size = 200 }: CountDownClockProps) => {
  return (
    <div
      className="shadow-lg rounded-full flex justify-center items-center p-4"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute z-10 flex flex-col items-center"
        style={{
          bottom: size / 2 - 16,
        }}
      >
        <GiAlarmClock size={36} />
        <div>00:25:00</div>
      </div>
      <CircularProgressbar
        styles={buildStyles({
          // Text size
          textSize: "16px",
          pathColor: "#0abce3",
          trailColor: "#aeaeae",
          backgroundColor: "#1171d3",
        })}
        value={value}
        maxValue={1}
        className="z-0"
      />
    </div>
  );
};
