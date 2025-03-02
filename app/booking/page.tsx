"use client";
import { useState, useEffect } from "react";

import { formatISTDate, parseISTDate } from "@/lib/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { BookingForm } from "@/components/BookingForm";
import { useRouter } from "next/navigation";

interface Taker {
  id: string;
  name: string;
  type: string;
  status: string; // AVAILABLE, UNDER_MAINTENANCE, or BOOKED
}

export default function BookingPage() {
  const [availableTakers, setAvailableTakers] = useState<Taker[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    parseISTDate(new Date().toISOString())
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Fetch available takers for the selected date
  useEffect(() => {
    const fetchAvailableTakers = async () => {
      try {
        setLoading(true);
        setError(null);

        const dateKey = formatISTDate(selectedDate);
        const response = await fetch(
          `/api/availability/takers?date=${dateKey}`
        );

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

    fetchAvailableTakers();
  }, [selectedDate]);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Book a Taker</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Date and Taker</CardTitle>
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
                  onClick={() => window.location.reload()}
                  className="ml-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <Label htmlFor="date">Select Date</Label>
            <Input
              type="date"
              id="date"
              value={formatISTDate(selectedDate)}
              min={formatISTDate(new Date())}
              onChange={(e) => setSelectedDate(parseISTDate(e.target.value))}
              className="mt-1"
            />
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
              No takers available for this date.
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
