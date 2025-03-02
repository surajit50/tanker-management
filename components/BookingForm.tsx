"use client";
import { useState } from "react";
import { bookTanker } from "@/app/actions";
import { formatISTDate } from "@/lib/dateUtils";

interface BookingFormProps {
  availableTakers: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export function BookingForm({ availableTakers }: BookingFormProps) {
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
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Book Taker</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="takerId"
            className="block text-sm font-medium text-gray-700"
          >
            Select Taker
          </label>
          <select
            name="takerId"
            id="takerId"
            required
            disabled={loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100"
          >
            {availableTakers.map((taker) => (
              <option key={taker.id} value={taker.id}>
                {taker.name} ({taker.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100"
          />
        </div>

        {error && (
          <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
        )}

        {success && (
          <div className="text-green-600 bg-green-100 p-2 rounded">
            Booking successful!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}