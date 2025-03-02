"use client";
import { useState, useEffect } from "react";

interface Taker {
  id: string;
  name: string;
  type: string;
  status: "AVAILABLE" | "UNDER_MAINTENANCE";
}

export function TakerManagement() {
  const [takers, setTakers] = useState<Taker[]>([]);

  useEffect(() => {
    const fetchTakers = async () => {
      const response = await fetch("/api/takers");
      const data = await response.json();
      setTakers(data);
    };

    fetchTakers();
  }, []);

  const handleStatusChange = async (
    takerId: string,
    newStatus: Taker["status"]
  ) => {
    try {
      const response = await fetch(`/api/takers/${takerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTakers((prev) =>
          prev.map((taker) =>
            taker.id === takerId ? { ...taker, status: newStatus } : taker
          )
        );
      }
    } catch (error) {
      console.error("Error updating taker status:", error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Manage Takers</h2>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {takers.map((taker) => (
            <tr key={taker.id} className="border-b">
              <td className="p-2">{taker.name}</td>
              <td className="p-2">{taker.type}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    taker.status === "AVAILABLE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {taker.status}
                </span>
              </td>
              <td className="p-2">
                {taker.status === "AVAILABLE" ? (
                  <button
                    onClick={() =>
                      handleStatusChange(taker.id, "UNDER_MAINTENANCE")
                    }
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Mark for Maintenance
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(taker.id, "AVAILABLE")}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Mark Available
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
