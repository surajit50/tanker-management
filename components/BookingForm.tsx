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
import { Input } from "@/components/ui/input"; // Import Input component
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
  const [progress, setProgress] = useState(0); // Progress state
  const [selectedTakerId, setSelectedTakerId] = useState<string>("");
  const [mobileNo, setMobileNo] = useState<string>(""); // State for mobile number
  const [deliveryAddress, setDeliveryAddress] = useState<string>(""); // State for delivery address
  const [localTakers, setLocalTakers] = useState<Taker[]>(allTakers);
  const router = useRouter();

  // Update localTakers when allTakers changes
  useEffect(() => {
    setLocalTakers(allTakers);
  }, [allTakers]);

  // Reset form when selectedDate changes
  useEffect(() => {
    setSelectedTakerId("");
    setMobileNo("");
    setDeliveryAddress("");
    setSuccess(false);
    setError(null);
  }, [selectedDate]); // Reset form when selectedDate changes

  const refreshData = useCallback(() => {
    router.refresh();
    onBookingSuccess(); // Trigger parent component refresh
  }, [router, onBookingSuccess]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    setProgress(0); // Reset progress

    const formData = new FormData(event.currentTarget);
    formData.append("date", selectedDate.toISOString());
    formData.append("mobileNo", mobileNo); // Add mobile number to form data
    formData.append("deliveryAddress", deliveryAddress); // Add delivery address to form data

    try {
      // Simulate progress (for demonstration purposes)
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev)); // Increment progress
      }, 300);

      await bookTanker(formData);
      setProgress(100); // Complete progress
      setSuccess(true);
      setSelectedTakerId("");
      setMobileNo("");
      setDeliveryAddress("");

      // Update local state immediately
      setLocalTakers((prevTakers) =>
        prevTakers.map((taker) =>
          taker.id === selectedTakerId ? { ...taker, status: "BOOKED" } : taker
        )
      );

      // Refresh data from server
      refreshData();
      clearInterval(interval); // Stop the progress interval
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book taker");
      setProgress(0); // Reset progress on error
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
        <Label htmlFor="takerId" className="text-lg font-semibold">
          Select Taker
        </Label>
        <Select
          name="takerId"
          required
          disabled={loading}
          value={selectedTakerId}
          onValueChange={setSelectedTakerId}
        >
          <SelectTrigger id="takerId" className="w-full py-3">
            <SelectValue placeholder="Choose a taker" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg rounded-lg">
            {availableTakers.map((taker) => (
              <SelectItem
                key={taker.id}
                value={taker.id}
                className="hover:bg-gray-100 cursor-pointer"
              >
                {taker.name} ({taker.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobileNo" className="text-lg font-semibold">
          Mobile Number
        </Label>
        <Input
          id="mobileNo"
          name="mobileNo"
          type="tel"
          placeholder="Enter mobile number"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          required
          disabled={loading}
          className="w-full py-3"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryAddress" className="text-lg font-semibold">
          Delivery Address
        </Label>
        <Input
          id="deliveryAddress"
          name="deliveryAddress"
          type="text"
          placeholder="Enter delivery address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          required
          disabled={loading}
          className="w-full py-3"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Booking successful!</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={loading || !selectedTakerId || !mobileNo || !deliveryAddress}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 relative overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }} // Progress bar
        />
        <span className="relative z-10 flex items-center justify-center">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking... ({progress}%)
            </>
          ) : (
            "Book Now"
          )}
        </span>
      </Button>
    </form>
  );
}
