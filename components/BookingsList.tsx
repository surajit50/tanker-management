"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.length > 0 ? (
              bookings.map((booking, index) => (
                <div key={booking.id}>
                  <div className="py-2">
                    <div className="font-medium">
                      {booking.taker.name} ({booking.taker.type})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                  </div>
                  {index < bookings.length - 1 && <Separator />}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-2">
                No bookings found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
