"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, UserIcon, CheckCircleIcon, PhoneIcon, MapPinIcon, ClockIcon } from "lucide-react";

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

  const formatDateTime = (dateString: string, group: string) => {
    const date = new Date(dateString);
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    
    const datePart = formatDate(dateString, group);
    const timePart = date.toLocaleTimeString('en-US', timeOptions);

    if (group === "Today" || group === "Tomorrow") {
      return `${datePart} • ${timePart}`;
    }
    return datePart;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 space-y-3 border rounded-lg">
            <Skeleton className="h-4 w-[200px]" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-[180px]" />
              <Skeleton className="h-3 w-[160px]" />
              <Skeleton className="h-3 w-[140px]" />
            </div>
            <Skeleton className="h-8 w-[100px]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <div className="flex items-center gap-3">
          <div>
            <AlertTitle>Error Loading Deliveries</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  if (allDeliveries.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <CalendarIcon className="mx-auto h-12 w-12 mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">No upcoming deliveries</h3>
        <p className="mt-1 text-sm text-gray-500">All caught up! Check back later for new deliveries.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <UserIcon className="h-8 w-8 text-primary" />
          <span>Upcoming Deliveries</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {today.length > 0 && (
          <div className="space-y-3">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Today's Deliveries ({today.length})
            </div>
            {today.map((delivery) => (
              <DeliveryCard 
                key={delivery.id}
                delivery={delivery}
                group="Today"
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        )}

        {tomorrow.length > 0 && (
          <div className="space-y-3">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Tomorrow's Deliveries ({tomorrow.length})
            </div>
            {tomorrow.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                group="Tomorrow"
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        )}

        {next7Days.length > 0 && (
          <div className="space-y-3">
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Next 7 Days ({next7Days.length})
            </div>
            {next7Days.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                group="Next 7 Days"
                formatDateTime={formatDateTime}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeliveryCard({ delivery, group, formatDateTime }: { 
  delivery: Booking, 
  group: string,
  formatDateTime: (date: string, group: string) => string 
}) {
  return (
    <div className="p-4 bg-white border rounded-lg hover:border-primary transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <CalendarIcon className="h-4 w-4" />
            {formatDateTime(delivery.date, group)}
          </div>
          
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{delivery.bookingby}</span>
            <span className="text-gray-500">•</span>
            <PhoneIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{delivery.mobileNo}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{delivery.deliveryAddress}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm bg-gray-100 px-2 py-1 rounded-md">
              Tanker: {delivery.taker.name} ({delivery.taker.type})
            </span>
          </div>
        </div>

        <Button
          size="sm"
          className="gap-2 md:w-auto w-full"
          onClick={() => {/* Handle completion */}}
        >
          <CheckCircleIcon className="h-4 w-4" />
          Mark Complete
        </Button>
      </div>
    </div>
  );
}
