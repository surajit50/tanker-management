
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

  // Helper function to group deliveries by date
  const groupDeliveriesByDate = (deliveries: Booking[]) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const groups = {
      today: [] as Booking[],
      tomorrow: [] as Booking[],
      next7Days: [] as Booking[],
    };

    deliveries.forEach((delivery) => {
      const deliveryDate = new Date(delivery.date);

      if (deliveryDate.toDateString() === today.toDateString()) {
        groups.today.push(delivery);
      } else if (deliveryDate.toDateString() === tomorrow.toDateString()) {
        groups.tomorrow.push(delivery);
      } else if (deliveryDate > today && deliveryDate <= new Date(today.setDate(today.getDate() + 7))) {
        groups.next7Days.push(delivery);
      }
    });

    return groups;
  };

  const { today, tomorrow, next7Days } = groupDeliveriesByDate(upcomingDeliveries);

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
      <div className="text-center text-gray-600 py-8">
        <CalendarIcon className="mx-auto h-8 w-8 mb-2" />
        No upcoming deliveries.
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <UserIcon className="h-6 w-6 text-primary" />
          Upcoming Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Deliveries */}
        {today.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                Today
              </span>
            </h3>
            <ul className="space-y-3">
              {today.map((delivery) => (
                <li key={delivery.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {delivery.taker.name} ({delivery.taker.type})
                        </p>
                        <p className="text-sm text-gray-500">
                          Scheduled for: {new Date(delivery.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          // Handle delivery actions (e.g., mark as completed)
                        }}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Mark as Completed
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tomorrow's Deliveries */}
        {tomorrow.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Tomorrow
              </span>
            </h3>
            <ul className="space-y-3">
              {tomorrow.map((delivery) => (
                <li key={delivery.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {delivery.taker.name} ({delivery.taker.type})
                        </p>
                        <p className="text-sm text-gray-500">
                          Scheduled for: {new Date(delivery.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          // Handle delivery actions (e.g., mark as completed)
                        }}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Mark as Completed
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next 7 Days' Deliveries */}
        {next7Days.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                Next 7 Days
              </span>
            </h3>
            <ul className="space-y-3">
              {next7Days.map((delivery) => (
                <li key={delivery.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {delivery.taker.name} ({delivery.taker.type})
                        </p>
                        <p className="text-sm text-gray-500">
                          Scheduled for: {new Date(delivery.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          // Handle delivery actions (e.g., mark as completed)
                        }}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Mark as Completed
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
