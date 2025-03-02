
"use client";
import { useState, useEffect } from "react";
import { BookingForm } from "@/components/BookingForm";
import { formatISTDate, parseISTDate } from "@/lib/dateUtils";

interface Taker {
  id: string;
  name: string;
  type: string;
  status: string; // AVAILABLE, UNDER_MAINTENANCE
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
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
          {error}
          <button
            onClick={() => window.location.reload()} // Retry fetching
            className="ml-2 text-sm underline hover:text-red-700"
          >
            Retry
          </button>
        </div>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition duration-200"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-600">
            <div role="status">
              <svg
                aria-hidden="true"
                className="inline w-8 h-8 text-gray-200 animate-spin fill-green-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">Loading available takers...</p>
          </div>
        ) : availableTakers.length === 0 ? (
          <div className="text-center text-gray-600">
            No takers available for this date.
          </div>
        ) : (
          <BookingForm allTakers={availableTakers} selectedDate={selectedDate} />
        )}
      </div>
    </div>
  );
}
