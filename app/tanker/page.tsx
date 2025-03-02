import { AddTakerForm } from "@/components/AddTakerForm";
import { TakerManagement } from "@/components/TakerManagement";

export default function TakersPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Manage Takers</h1>

      <AddTakerForm />
      <TakerManagement />
    </div>
  );
}
