
"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface Taker {
  id: string;
  name: string;
  type: string;
  status: string; // AVAILABLE, UNDER_MAINTENANCE, or BOOKED
}

interface BookingFormProps {
  allTakers: Taker[];
  selectedDate: Date;
  onBookingSuccess: () => void; // Trigger parent component refresh
}

const formSchema = z.object({
  takerId: z.string().min(1, "Please select a taker"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  mobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
  bookingBy: z.string().optional(),
});

export function BookingForm({
  allTakers,
  selectedDate,
  onBookingSuccess,
}: BookingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localTakers, setLocalTakers] = useState<Taker[]>(allTakers);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      takerId: "",
      deliveryAddress: "",
      mobileNo: "",
      bookingBy: "",
    },
  });

  // Update localTakers when allTakers changes
  useEffect(() => {
    setLocalTakers(allTakers);
  }, [allTakers]);

  // Reset form when selectedDate changes
  useEffect(() => {
    form.reset();
    setSuccess(false);
    setError(null);
  }, [selectedDate]);

  const refreshData = () => {
    router.refresh();
    onBookingSuccess(); // Trigger parent component refresh
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    setProgress(0); // Reset progress

    const formData = new FormData();
    formData.append("takerId", values.takerId);
    formData.append("deliveryAddress", values.deliveryAddress);
    formData.append("mobileNo", values.mobileNo);
    if (values.bookingBy) formData.append("bookingBy", values.bookingBy);
    formData.append("date", selectedDate.toISOString());

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);

      await bookTanker(formData);
      setProgress(100); // Complete progress
      setSuccess(true);

      // Update local state immediately
      setLocalTakers((prevTakers) =>
        prevTakers.map((taker) =>
          taker.id === values.takerId ? { ...taker, status: "BOOKED" } : taker
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="takerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Select Taker</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger className="w-full py-3">
                    <SelectValue placeholder="Choose a taker" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white shadow-lg rounded-lg">
                  {availableTakers.length > 0 ? (
                    availableTakers.map((taker) => (
                      <SelectItem
                        key={taker.id}
                        value={taker.id}
                        className="hover:bg-gray-100 cursor-pointer"
                      >
                        {taker.name} ({taker.type})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No available takers
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Delivery Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter delivery address"
                  disabled={loading}
                  className="w-full py-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobileNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Mobile Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter mobile number"
                  disabled={loading}
                  className="w-full py-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bookingBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Booking By (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter name of person booking"
                  disabled={loading}
                  className="w-full py-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          disabled={loading || !form.formState.isValid}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
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
    </Form>
  );
}
