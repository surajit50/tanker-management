"use client";
import { useState, useEffect } from "react";

interface Booking {
  id: string;
  date: string;
  taker: {
    id: string;
    name: string;
    type: string;
  };
}

export function UpcomingDeUpcomingDeliveriesliveries() {
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingDeliveries = async () => {
      try {
        const response = await fetch("/api/deliveries/upcoming");

        if (!response.ok) {
          throw new Error("Failed to fetch upcoming deliveries");
        }

        const data = await response.json();
        setUpcomingDeliveries(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch upcoming deliveries"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingDeliveries();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-2 text-sm underline hover:text-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (upcomingDeliveries.length === 0) {
    return <div className="text-center text-gray-600">No upcoming deliveries.</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Upcoming Deliveries</h2>
      <ul className="space-y-4">
        {upcomingDeliveries.map((delivery) => (
          <li key={delivery.id} className="border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {delivery.taker.name} ({delivery.taker.type})
                </p>
                <p className="text-sm text-gray-600">
                  Scheduled for: {new Date(delivery.date).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  // Handle delivery actions (e.g., mark as completed)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                Mark as Completed
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
