"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Taker } from "./BookingPageClient"; // Import the Taker type

interface BookingFormProps {
  allTakers: Taker[];
  selectedDate: Date;
  onBookingSuccess: () => void;
}

interface BookingFormData {
  takerId: string;
  date: string;
}

export function BookingForm({
  allTakers,
  selectedDate,
  onBookingSuccess,
}: BookingFormProps) {
  const { register, handleSubmit, formState, setValue } = useForm<BookingFormData>();

  useEffect(() => {
    // Pre-fill the form with the selected date
    setValue("date", selectedDate.toISOString().split("T")[0]);
  }, [selectedDate, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      onBookingSuccess();
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="taker" className="block text-sm font-medium mb-1">
          Select Taker
        </label>
        <select
          id="taker"
          {...register("takerId", { required: true })}
          className="w-full p-2 border rounded-md"
        >
          {allTakers.map((taker) => (
            <option key={taker.id} value={taker.id}>
              {taker.name} ({taker.type})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          Booking Date
        </label>
        <Input
          type="date"
          id="date"
          {...register("date", { required: true })}
          className="w-full"
        />
      </div>

      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Booking..." : "Confirm Booking"}
      </Button>
    </form>
  );
}
