
"use client";

import { Suspense } from "react";
import {ClientForm }from "@/components/BookingPageClient";

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientForm />
    </Suspense>
  );
}
