"use client";

import type React from "react";

import { useState } from "react";
import { bookTanker } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Taker {
  id: string;
  name: string;
  type: string;
  status: string; // AVAILABLE, UNDER_MAINTENANCE, or BOOKED
}

interface BookingFormProps {
  allTakers: Taker[];
  selectedDate: Date;
}

export function BookingForm({ allTakers, selectedDate }: BookingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("date", selectedDate.toISOString()); // Add selectedDate to form data

    try {
      await bookTanker(formData);
      setSuccess(true);
      (event.target as HTMLFormElement).reset(); // Reset form after successful booking
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book taker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="takerId">Select Taker</Label>
        <Select name="takerId" required disabled={loading}>
          <SelectTrigger id="takerId">
            <SelectValue placeholder="Choose a taker" />
          </SelectTrigger>
          <SelectContent>
            {allTakers.map((taker) => (
              <SelectItem
                key={taker.id}
                value={taker.id}
                disabled={taker.status !== "AVAILABLE"}
              >
                {taker.name} ({taker.type})
                {taker.status !== "AVAILABLE" &&
                  ` (${
                    taker.status === "UNDER_MAINTENANCE"
                      ? "Under Maintenance"
                      : "Booked"
                  })`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Booking successful!</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Booking...
          </>
        ) : (
          "Book Now"
        )}
      </Button>
    </form>
  );
}
