
"use client";


import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface TakerFormInputs {
  name: string;
  type: string;
  status: string;
}

interface ClientFormProps {
  onSubmit: (data: TakerFormInputs) => void;
  isLoading?: boolean;
  initialData?: TakerFormInputs;
}

export function ClientForm({
  onSubmit,
  isLoading,
  initialData,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TakerFormInputs>({
    defaultValues: initialData,
  });

  const handleFormSubmit: SubmitHandler<TakerFormInputs> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Name Field */}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Type Field */}
      <div>
        <Label htmlFor="type">Type</Label>
        <Input
          id="type"
          {...register("type", { required: "Type is required" })}
        />
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Status Field */}
      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          {...register("status", { required: "Status is required" })}
          className="w-full p-2 border rounded-md"
        >
          <option value="AVAILABLE">Available</option>
          <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          <option value="BOOKED">Booked</option>
        </select>
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Save Taker"}
      </Button>
    </form>
  );
}
