"use client";

import { addWeeks } from "date-fns";
import { NavigationControl } from "@/components/calendar/NavigationControl";
import { WeeklyGrid } from "@/components/calendar/WeeklyGrid";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";
import { useModal } from "@/components/modals";
import { useWeek } from "@/atoms/week";

export default function Home() {
  const { user, loading } = useAuth();

  const { setWeek } = useWeek();
  const navigateWeek = (direction: "prev" | "next" | "current") => {
    if (direction === "current") {
      setWeek(new Date());
      return;
    }
    setWeek((date) => addWeeks(date, direction === "next" ? 1 : -1));
  };

  const { modal, openModal } = useModal("TargetCreateModal");
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
        <div className="bg-background rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-accent rounded mb-4"></div>
            <div className="h-8 bg-accent rounded mb-4"></div>
            <div className="h-8 bg-accent rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome to the Weekly Calendar</h1>
        <div className="bg-background rounded-lg shadow p-6">
          <p>
            Please{" "}
            <Link className={"text-primary underline"} href={"/auth"}>
              log in
            </Link>{" "}
            to view your calendar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {modal}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-6">Weekly Calendar</h1>
        <Button onClick={() => openModal({})}>
          <IoMdAdd size={24} />
          <span>Create Target</span>
        </Button>
      </div>

      <div className="rounded-lg shadow p-6 border">
        {/* Navigation Controls */}
        <NavigationControl onNavigate={navigateWeek} />

        {/* Weekly Grid */}
        <WeeklyGrid />
      </div>
    </div>
  );
}
