import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  try {
    const selectedDate = new Date(date);

    // Find all takers that are available and not booked for the selected date
    const availableTakers = await prisma.taker.findMany({
      where: {
        status: "AVAILABLE",
        bookings: {
          none: {
            date: {
              equals: selectedDate,
            },
          },
        },
      },
    });

    return NextResponse.json(availableTakers);
  } catch (error) {
    console.error("Error fetching available takers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch available takers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
