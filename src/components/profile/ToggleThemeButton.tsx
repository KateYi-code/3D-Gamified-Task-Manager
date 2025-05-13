import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FC } from "react";

interface Props {
  className?: string;
}
export const ToggleThemeButton: FC<Props> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  return (
    <div
      className={`flex items-center space-x-2 ${className} cursor-pointer justify-between`}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Label>Dark Mode</Label>
      <Switch checked={theme === "dark"} />
    </div>
  );
};
