
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
      <div className="text-center text-gray-600">
        <CalendarIcon className="mx-auto h-8 w-8 mb-2" />
        No upcoming deliveries.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-6 w-6" />
          Upcoming Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Deliveries */}
        {today.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Today</h3>
            <ul className="space-y-4">
              {today.map((delivery) => (
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
                          size="sm"
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
          </div>
        )}

        {/* Tomorrow's Deliveries */}
        {tomorrow.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Tomorrow</h3>
            <ul className="space-y-4">
              {tomorrow.map((delivery) => (
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
                          size="sm"
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
          </div>
        )}

        {/* Next 7 Days' Deliveries */}
        {next7Days.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Next 7 Days</h3>
            <ul className="space-y-4">
              {next7Days.map((delivery) => (
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
                          size="sm"
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
