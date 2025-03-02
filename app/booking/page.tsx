
"use client";

import { Suspense } from "react";
import BookingPageClient from "@/components/BookingPageClient";

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageClient />
    </Suspense>
  );
}
