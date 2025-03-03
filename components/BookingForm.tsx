"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "lucide-react";

interface Taker {
  id: string;
  name: string;
  type: string;
}

interface BookingFormInputs {
  date: string;
  takerId: string;
  bookingBy: string;
  mobileNo: string;
  deliveryAddress: string;
}

interface BookingFormProps {
  takers: Taker[];
  onSubmit: (data: BookingFormInputs) => void;
  isLoading?: boolean;
}

export function BookingForm({ takers, onSubmit, isLoading }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormInputs>();

  const handleFormSubmit: SubmitHandler<BookingFormInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Date Field */}
      <div>
        <Label htmlFor="date">Booking Date</Label>
        <Input
          id="date"
          type="datetime-local"
          {...register("date", { required: "Date is required" })}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Taker Dropdown */}
      <div>
        <Label htmlFor="takerId">Select Taker</Label>
        <select
          id="takerId"
          {...register("takerId", { required: "Taker is required" })}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select a taker</option>
          {takers.map((taker) => (
            <option key={taker.id} value={taker.id}>
              {taker.name} ({taker.type})
            </option>
          ))}
        </select>
        {errors.takerId && (
          <p className="text-sm text-red-500">{errors.takerId.message}</p>
        )}
      </div>

      {/* Booking By Field */}
      <div>
        <Label htmlFor="bookingBy">Booking By</Label>
        <Input
          id="bookingBy"
          {...register("bookingBy", { required: "Name is required" })}
        />
        {errors.bookingBy && (
          <p className="text-sm text-red-500">{errors.bookingBy.message}</p>
        )}
      </div>

      {/* Mobile Number Field */}
      <div>
        <Label htmlFor="mobileNo">Mobile Number</Label>
        <Input
          id="mobileNo"
          {...register("mobileNo", { required: "Mobile number is required" })}
        />
        {errors.mobileNo && (
          <p className="text-sm text-red-500">{errors.mobileNo.message}</p>
        )}
      </div>

      {/* Delivery Address Field */}
      <div>
        <Label htmlFor="deliveryAddress">Delivery Address</Label>
        <Input
          id="deliveryAddress"
          {...register("deliveryAddress", {
            required: "Delivery address is required",
          })}
        />
        {errors.deliveryAddress && (
          <p className="text-sm text-red-500">{errors.deliveryAddress.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Create Booking"}
      </Button>
    </form>
  );
}
