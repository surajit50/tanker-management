import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const takers = await prisma.taker.findMany();
    return NextResponse.json(takers);
  } catch (error) {
    console.error("Error fetching takers:", error);
    return NextResponse.json(
      { error: "Failed to fetch takers" },
      { status: 500 }
    );
  }
}
