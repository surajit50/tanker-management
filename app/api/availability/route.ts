import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseISTDate, formatISTDate } from "@/lib/dateUtils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  if (isNaN(month) || isNaN(year)) {
    return NextResponse.json(
      { error: "Invalid month or year" },
      { status: 400 }
    );
  }

  try {
    const startDate = parseISTDate(`${year}-${month}-01`); // First day of the month
    const endDate = parseISTDate(`${year}-${month + 1}-01`); // First day of the next month

    // Fetch all bookings for the selected month
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        taker: true,
      },
    });

    // Fetch all takers
    const takers = await prisma.taker.findMany();

    // Create availability map
    const availability: Record<string, boolean> = {};
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = parseISTDate(`${year}-${month}-${day}`);
      const dateKey = formatISTDate(currentDate);

      // Check if any available takers exist for this date
      const availableTakers = takers.filter(
        (taker) =>
          taker.status === "AVAILABLE" &&
          !bookings.some(
            (booking) =>
              booking.takerId === taker.id &&
              formatISTDate(booking.date) === dateKey
          )
      );

      availability[dateKey] = availableTakers.length > 0;
    }

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching availability data:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability data" },
      { status: 500 }
    );
  }
}