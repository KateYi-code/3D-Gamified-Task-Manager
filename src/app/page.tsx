"use client";

import { useState } from "react";
import { addWeeks } from "date-fns";
import { NavigationControl } from "@/components/calendar/NavigationControl";
import { WeeklyGrid } from "@/components/calendar/WeeklyGrid";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateWeek = (direction: "prev" | "next" | "current") => {
    if (direction === "current") {
      setCurrentDate(new Date());
      return;
    }
    setCurrentDate((date) => addWeeks(date, direction === "next" ? 1 : -1));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome to the Weekly Calendar</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Please{" "}
            <Link className={"text-blue-500 underline"} href={"/auth"}>
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
