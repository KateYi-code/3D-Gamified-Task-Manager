"use client";

import { useState } from "react";
import { addWeeks } from "date-fns";
import { NavigationControl } from "@/components/calendar/NavigationControl";
import { WeeklyGrid } from "@/components/calendar/WeeklyGrid";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateWeek = (direction: "prev" | "next" | "current") => {
    if (direction === "current") {
      setCurrentDate(new Date());
      return;
    }
    setCurrentDate((date) => addWeeks(date, direction === "next" ? 1 : -1));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Weekly Calendar</h1>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Navigation Controls */}
        <NavigationControl onNavigate={navigateWeek} currentDate={currentDate} />

        {/* Weekly Grid */}
        <WeeklyGrid currentDate={currentDate} />
      </div>
    </div>
  );
}
