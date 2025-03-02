import { BookingsList } from "@/components/BookingsList";
import { Calendar } from "@/components/Calendar";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">
        Gram Panchayat Management System
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Calendar />
          <BookingsList />
        </div>
      </div>
    </div>
  );
}
