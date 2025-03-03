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
  bookingby: string;
  deliveryAddress: string;
  mobileNo: string;
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
        if (!response.ok)
          throw new Error("Failed to fetch upcoming deliveries");
        const data = await response.json();
        setUpcomingDeliveries(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch deliveries"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingDeliveries();
  }, []);

  const groupDeliveriesByDate = (deliveries: Booking[]) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Helper function to compare dates without time
    const isSameDate = (date1: Date, date2: Date) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    return deliveries.reduce(
      (
        acc: { today: Booking[]; tomorrow: Booking[]; next7Days: Booking[] },
        delivery
      ) => {
        const deliveryDate = new Date(delivery.date);
        if (isSameDate(deliveryDate, today)) {
          acc.today.push(delivery);
        } else if (isSameDate(deliveryDate, tomorrow)) {
          acc.tomorrow.push(delivery);
        } else if (deliveryDate > today && deliveryDate <= nextWeek) {
          acc.next7Days.push(delivery);
        }
        return acc;
      },
      { today: [], tomorrow: [], next7Days: [] }
    );
  };

  const { today, tomorrow, next7Days } =
    groupDeliveriesByDate(upcomingDeliveries);

  const allDeliveries = [
    ...today.map((d) => ({ ...d, group: "Today" as const })),
    ...tomorrow.map((d) => ({ ...d, group: "Tomorrow" as const })),
    ...next7Days.map((d) => ({ ...d, group: "Next 7 Days" as const })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatDate = (dateString: string, group: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions =
      group === "Next 7 Days"
        ? { weekday: "short", month: "short", day: "numeric" }
        : { month: "short", day: "numeric" };

    const datePart = date.toLocaleDateString("en-US", options);

    if (group === "Today") return `Today, ${datePart}`;
    if (group === "Tomorrow") return `Tomorrow, ${datePart}`;
    return datePart;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[58px] w-full rounded-lg" />
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

  if (allDeliveries.length === 0) {
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
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Booking By
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Booker Mobile No
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Delivery Location
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Tanker Name
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allDeliveries.map((delivery) => (
                <tr
                  key={delivery.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {delivery.group === "Today" && (
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      )}
                      {delivery.group === "Tomorrow" && (
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                      {formatDate(delivery.date, delivery.group)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {delivery.bookingby}
                  </td>
                  <td>{delivery.mobileNo}</td>

                  <td>{delivery.deliveryAddress}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {delivery.taker.name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        /* Handle completion */
                      }}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Complete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
