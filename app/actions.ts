"use server";
import { parseISTDate } from "@/lib/dateUtils";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function bookTanker(formData: FormData) {
  const takerId = formData.get("takerId") as string;
  const date = parseISTDate(formData.get("date") as string);
  const mobileNo = formData.get("mobileNo") as string; // Add mobile number
  const bookingBy = formData.get("bookingBy") as string; // Add mobile number
  const deliveryAddress = formData.get("deliveryAddress") as string; // Add delivery address

  // Check if takerId is provided and valid
  if (takerId) {
    const takerExists = await prisma.taker.findUnique({
      where: { id: takerId },
    });

    if (!takerExists) {
      throw new Error("Invalid taker ID");
    }

    // Check if the taker is already booked for the selected date
    const existingBooking = await prisma.booking.findFirst({
      where: {
        takerId,
        date: {
          equals: date,
        },
      },
    });

    if (existingBooking) {
      throw new Error("Selected taker is already booked for this date");
    }
  }

  // Create the booking
  await prisma.booking.create({
    data: {
      takerId: takerId,
      date,
      bookingBy,
      mobileNo, // Include mobile number
      deliveryAddress, // Include delivery address
    },
  });

  revalidatePath("/"); // Revalidate the booking page to reflect changes
}

// New action: Mark taker as available
export async function markTakerAvailable(takerId: string) {
  await prisma.taker.update({
    where: { id: takerId },
    data: { status: "AVAILABLE" },
  });
  revalidatePath("/dashboard");
}

// Updated availability check
export async function getAvailableTakers(date: Date) {
  return await prisma.taker.findMany({
    where: {
      status: "AVAILABLE",
      bookings: {
        none: {
          date: {
            equals: date,
          },
        },
      },
    },
  });
}

export async function addTaker(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;

    // Validate input
    if (!name || !type) {
      throw new Error("Name and type are required");
    }

    // Create the taker
    const newTaker = await prisma.taker.create({
      data: {
        name,
        type,
        status: "AVAILABLE", // Default status
      },
    });

    // Revalidate the takers page to reflect changes
    revalidatePath("/takers");

    return newTaker;
  } catch (error) {
    console.error("Error adding taker:", error);
    throw new Error("Failed to add taker");
  }
}
