"use client";
import { useState, useEffect } from "react";
import { BookingForm } from "@/components/BookingForm";
import { formatISTDate, parseISTDate } from "@/lib/dateUtils";

interface Taker {
  id: string;
  name: string;
  type: string;
}

export default function BookingPage() {
  const [availableTakers, setAvailableTakers] = useState<Taker[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    parseISTDate(new Date().toISOString())
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch available takers for the selected date
  useEffect(() => {
    const fetchAvailableTakers = async () => {
      try {
        setLoading(true);
        setError(null);

        const dateKey = formatISTDate(selectedDate);
        const response = await fetch(
          `/api/availability/takers?date=${dateKey}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch available takers");
        }

        const data = await response.json();
        setAvailableTakers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch available takers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTakers();
  }, [selectedDate]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Book a Taker</h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>
      )}

      <div className="bg-white shadow rounded-lg p-4">
        <div className="mb-6">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={formatISTDate(selectedDate)}
            min={formatISTDate(new Date())}
            onChange={(e) => setSelectedDate(parseISTDate(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-600">
            Loading available takers...
          </div>
        ) : availableTakers.length === 0 ? (
          <div className="text-center text-gray-600">
            No takers available for this date.
          </div>
        ) : (
          <BookingForm availableTakers={availableTakers} />
        )}
      </div>
    </div>
  );
}
