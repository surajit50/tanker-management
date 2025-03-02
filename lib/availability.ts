import prisma from "./prisma";
import { Taker, Booking } from "@prisma/client";
interface DateAvailability {
  [date: string]: boolean;
}

export async function getDateAvailability(
  month: number,
  year: number
): Promise<DateAvailability> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const [bookings, takers] = await Promise.all([
    prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.taker.findMany(),
  ]);

  const availability: DateAvailability = {};
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const dateKey = currentDate.toISOString().split("T")[0];

    const availableTakers = takers.filter(
      (taker:Taker) =>
        taker.status === "AVAILABLE" &&
        !bookings.some(
          (booking) =>
            booking.takerId === taker.id &&
            booking.date.toISOString().split("T")[0] === dateKey
        )
    );

    availability[dateKey] = availableTakers.length > 0;
  }

  return availability;
}
