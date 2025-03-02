"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
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
import { useRouter } from "next/navigation";

interface Taker {
  id: string;
  name: string;
  type: string;
  status: string; // AVAILABLE, UNDER_MAINTENANCE, or BOOKED
}

interface BookingFormProps {
  allTakers: Taker[];
  selectedDate: Date;
  onBookingSuccess: () => void; // New prop to trigger parent component refresh
}

export function BookingForm({
  allTakers,
  selectedDate,
  onBookingSuccess,
}: BookingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTakerId, setSelectedTakerId] = useState<string>("");
  const [localTakers, setLocalTakers] = useState<Taker[]>(allTakers);
  const router = useRouter();

  // Update localTakers when allTakers changes
  useEffect(() => {
    setLocalTakers(allTakers);
  }, [allTakers]);

  // Reset form when selectedDate changes
  useEffect(() => {
    setSelectedTakerId("");
    setSuccess(false);
    setError(null);
  }, []); // Removed selectedDate from dependencies

  const refreshData = useCallback(() => {
    router.refresh();
    onBookingSuccess(); // Trigger parent component refresh
  }, [router, onBookingSuccess]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("date", selectedDate.toISOString());

    try {
      await bookTanker(formData);
      setSuccess(true);
      setSelectedTakerId("");

      // Update local state immediately
      setLocalTakers((prevTakers) =>
        prevTakers.map((taker) =>
          taker.id === selectedTakerId ? { ...taker, status: "BOOKED" } : taker
        )
      );

      // Refresh data from server
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book taker");
    } finally {
      setLoading(false);
    }
  };

  const availableTakers = localTakers.filter(
    (taker) => taker.status === "AVAILABLE"
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="takerId">Select Taker</Label>
        <Select
          name="takerId"
          required
          disabled={loading}
          value={selectedTakerId}
          onValueChange={setSelectedTakerId}
        >
          <SelectTrigger id="takerId">
            <SelectValue placeholder="Choose a taker" />
          </SelectTrigger>
          <SelectContent>
            {availableTakers.map((taker) => (
              <SelectItem key={taker.id} value={taker.id}>
                {taker.name} ({taker.type})
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

      <Button
        type="submit"
        disabled={loading || !selectedTakerId}
        className="w-full"
      >
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
