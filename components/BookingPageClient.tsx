
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { AlertCircle, Loader2, RefreshCw, Calendar, CheckCircle, XCircle } from "lucide-react";
import { BookingForm } from "./BookingForm";

interface Taker {
  id: string;
  name: string;
  type: string;
  status: string; // AVAILABLE, UNDER_MAINTENANCE, or BOOKED
}

export default function BookingPageClient() {
  const [availableTakers, setAvailableTakers] = useState<Taker[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Initialize with current date
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params from the URL

  // Read the date from the search params and update selectedDate
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }
  }, [searchParams]);

  // Fetch available takers for the selected date
  const fetchAvailableTakers = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateKey = selectedDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const response = await fetch(`/api/availability/takers?date=${dateKey}`);

      if (!response.ok) {
        throw new Error("Failed to fetch available takers");
      }

      const data = await response.json();
      setAvailableTakers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch available takers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableTakers();
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value); // Parse the date from the input
    if (isNaN(newDate.getTime())) return; // Validate the date

    setSelectedDate(newDate);

    // Update the URL with the new date
    const dateKey = newDate.toISOString().split("T")[0];
    router.push(`/booking?date=${dateKey}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-8 w-8 text-primary" />
        Book a Taker
      </h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Select Date and Taker
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAvailableTakers}
                  className="ml-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <Label htmlFor="date" className="block text-sm font-medium mb-1">
              Select Date
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                id="date"
                value={selectedDate.toISOString().split("T")[0]} // Format as YYYY-MM-DD
                min={new Date().toISOString().split("T")[0]} // Set min date to today
                onChange={handleDateChange} // Handle date change
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAvailableTakers}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">
                Loading available takers...
              </p>
            </div>
          ) : availableTakers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <XCircle className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>No takers available for this date.</p>
            </div>
          ) : (
            <BookingForm
              allTakers={availableTakers}
              selectedDate={selectedDate}
              onBookingSuccess={() => router.refresh()}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
