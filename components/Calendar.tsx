"use client";
import { useEffect, useState } from "react";
import { formatISTDate, parseISTDate } from "@/lib/dateUtils";

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(parseISTDate(new Date().toISOString()));
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const response = await fetch(
          `/api/availability?month=${month}&year=${year}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch availability data");
        }

        const data = await response.json();
        setAvailability(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load availability data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [currentDate]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const handleDateClick = (date: Date) => {
    const dateKey = formatISTDate(date);
    if (availability[dateKey]) {
      alert(`You clicked on ${date.toLocaleDateString()}`);
      // You can replace this with a function to open a booking form
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentDate(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
            )
          }
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Previous
        </button>
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() =>
            setCurrentDate(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
            )
          }
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading availability...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium p-2 bg-gray-100">
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              i + 1
            );
            const dateKey = formatISTDate(date);
            const isAvailable = availability[dateKey];

            return (
              <div
                key={dateKey}
                className={`p-2 text-center border rounded transition-all
                  ${
                    isAvailable
                      ? "bg-green-200 hover:bg-green-300 cursor-pointer"
                      : "bg-red-200 opacity-50 cursor-not-allowed"
                  }
                  ${
                    date.toDateString() === new Date().toDateString()
                      ? "border-2 border-blue-500"
                      : ""
                  }
                `}
                title={isAvailable ? "Available" : "Not Available"}
                onClick={() => handleDateClick(date)}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}