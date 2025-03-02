"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, UserIcon, CheckCircleIcon } from "lucide-react";

interface Booking {
  id: string;
  date: string;
  taker: {
    id: string;
    name: string;
    type: string;
  };
}

export function UpcomingDeliveries() {
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

        // Filter deliveries within the next 7 days
        const today = new Date();
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);

        const filteredDeliveries = data.filter((delivery: Booking) => {
          const deliveryDate = new Date(delivery.date);
          return deliveryDate >= today && deliveryDate <= sevenDaysLater;
        });

        setUpcomingDeliveries(filteredDeliveries);
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
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (upcomingDeliveries.length === 0) {
    return (
      <div className="text-center text-gray-600">
        <CalendarIcon className="mx-auto h-8 w-8 mb-2" />
        No upcoming deliveries within the next 7 days.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-6 w-6" />
          Upcoming Deliveries (Next 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {upcomingDeliveries.map((delivery) => (
            <li key={delivery.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {delivery.taker.name} ({delivery.taker.type})
                      </p>
                      <p className="text-sm text-gray-600">
                        Scheduled for: {new Date(delivery.date).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        // Handle delivery actions (e.g., mark as completed)
                      }}
                      className="gap-2"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Mark as Completed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
