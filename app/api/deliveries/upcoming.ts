import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const currentDate = new Date(); // Get the current date and time

    // Fetch upcoming deliveries (bookings with a date >= current date)
    const upcomingDeliveries = await prisma.booking.findMany({
      where: {
        date: {
          gte: currentDate, // Greater than or equal to the current date
        },
      },
      include: {
        taker: true, // Include the associated taker details
      },
      orderBy: {
        date: "asc", // Sort by date in ascending order
      },
    });

    return NextResponse.json(upcomingDeliveries);
  } catch (err) {
    console.error("Error fetching upcoming deliveries:", err);
    return NextResponse.json(
      { error: "Failed to fetch upcoming deliveries" },
      { status: 500 }
    );
  }
}
