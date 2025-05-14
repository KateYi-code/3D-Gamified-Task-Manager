import { useMemo } from "react";

interface Props {
  name: string;
  size: "small" | "medium" | "large";
}
export const TextAvatar = ({ name, size }: Props) => {
  const nameShort = useMemo(() => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[1].charAt(0).toUpperCase()}`;
    }
    return name.substring(0, 2).toUpperCase();
  }, [name]);

  const sizeClass = useMemo(() => {
    switch (size) {
      case "small":
        return "w-8 h-8 text-sm";
      case "medium":
        return "w-16 h-15 text-md";
      case "large":
        return "w-24 h-24 text-2xl";
      default:
        return "w-8 h-8 text-sm";
    }
  }, [size]);
  return (
    <div className={`rounded-full bg-primary flex items-center justify-center ${sizeClass}`}>
      {nameShort}
    </div>
  );
};
