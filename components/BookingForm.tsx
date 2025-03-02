
"use client";
import { useState } from "react";
import { bookTanker } from "@/app/actions";
import { formatISTDate } from "@/lib/dateUtils";

interface Taker {
  id: string;
  name: string;
  type: string;
  isAvailable: boolean; // Add this field to distinguish available/unavailable takers
}

interface BookingFormProps {
  allTakers: Taker[]; // Pass all takers (both available and unavailable)
}

export function BookingForm({ allTakers }: BookingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const date = new Date(formData.get("date") as string);

    // Validate date
    if (date < new Date()) {
      setError("Please select a future date.");
      setLoading(false);
      return;
    }

    try {
      await bookTanker(formData);
      setSuccess(true);
      (event.target as HTMLFormElement).reset(); // Reset form after successful booking
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book taker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Taker</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="takerId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Taker
          </label>
          <select
            name="takerId"
            id="takerId"
            required
            disabled={loading}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:bg-gray-100 transition duration-200"
          >
            {allTakers.map((taker) => (
              <option
                key={taker.id}
                value={taker.id}
                disabled={!taker.isAvailable} // Disable if taker is unavailable
              >
                {taker.name} ({taker.type}){!taker.isAvailable && " (Unavailable)"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            required
            min={formatISTDate(new Date())}
            disabled={loading}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 disabled:bg-gray-100 transition duration-200"
          />
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 bg-green-50 p-3 rounded-lg text-sm">
            Booking successful!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}
