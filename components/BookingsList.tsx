"use client";
import { useEffect, useState } from "react";

interface Booking {
  id: string;
  date: string;
  taker: {
    name: string;
    type: string;
  };
}

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Bookings</h2>
      <div className="space-y-2">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="border-b pb-2">
              <div className="font-medium">
                {booking.taker.name} ({booking.taker.type})
              </div>
              <div className="text-sm text-gray-600">
                {new Date(booking.date).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-600">No bookings found</div>
        )}
      </div>
    </div>
  );
}
