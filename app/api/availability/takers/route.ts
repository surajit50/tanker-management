
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateKey = searchParams.get("date");

  if (!dateKey) {
    return NextResponse.json(
      { error: "Date is required" },
      { status: 400 }
    );
  }

  const selectedDate = new Date(dateKey);

  try {
    // Fetch all takers
    const takers = await prisma.taker.findMany();

    // Fetch bookings for the selected date
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: new Date(selectedDate.setHours(0, 0, 0, 0)), // Start of the day
          lt: new Date(selectedDate.setHours(23, 59, 59, 999)), // End of the day
        },
      },
    });

    // Map takers with their availability status
    const availableTakers = takers.map((taker) => {
      const isBooked = bookings.some((booking) => booking.takerId === taker.id);
      return {
        ...taker,
        status: isBooked ? "BOOKED" : taker.status, // Mark as BOOKED if already booked
      };
    });

    return NextResponse.json(availableTakers);
  } catch (err) {
    console.error("Error fetching available takers:", err);
    return NextResponse.json(
      { error: "Failed to fetch available takers" },
      { status: 500 }
    );
  }
}
