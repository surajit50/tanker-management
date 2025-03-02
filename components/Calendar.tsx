
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { formatISTDate, parseISTDate } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export function Calendar() {
  const router = useRouter(); // Initialize useRouter
  const [currentDate, setCurrentDate] = useState(
    parseISTDate(new Date().toISOString())
  );
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
      // Redirect to the booking page with the selected date
      router.push(`/booking?date=${dateKey}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <CardTitle>
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-medium p-2 bg-muted/50"
              >
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
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <Button
                  key={dateKey}
                  variant="outline"
                  className={`p-2 h-auto aspect-square ${
                    isAvailable
                      ? "bg-green-100 hover:bg-green-200 text-green-900"
                      : "bg-red-100 hover:bg-red-200 text-red-900"
                  } ${
                    isToday ? "ring-2 ring-primary" : ""
                  } transition-colors duration-200`}
                  disabled={!isAvailable}
                  onClick={() => handleDateClick(date)}
                >
                  {i + 1}
                </Button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
