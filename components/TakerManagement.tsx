"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Taker {
  id: string;
  name: string;
  type: string;
  status: "AVAILABLE" | "UNDER_MAINTENANCE";
}

export function TakerManagement() {
  const [takers, setTakers] = useState<Taker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTakers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/takers");
        if (!response.ok) {
          throw new Error("Failed to fetch takers");
        }
        const data = await response.json();
        setTakers(data);
      } catch (error) {
        console.error("Error fetching takers:", error);
      } finally {
        setLoading(false);
      }
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

      if (!response.ok) {
        throw new Error("Failed to update taker status");
      }

      setTakers((prev) =>
        prev.map((taker) =>
          taker.id === takerId ? { ...taker, status: newStatus } : taker
        )
      );
    } catch (error) {
      console.error("Error updating taker status:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Takers</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {takers.map((taker) => (
                <TableRow key={taker.id}>
                  <TableCell className="font-medium">{taker.name}</TableCell>
                  <TableCell>{taker.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        taker.status === "AVAILABLE" ? "default" : "destructive"
                      }
                    >
                      {taker.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {taker.status === "AVAILABLE" ? (
                      <Button
                        onClick={() =>
                          handleStatusChange(taker.id, "UNDER_MAINTENANCE")
                        }
                        variant="destructive"
                      >
                        Mark for Maintenance
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleStatusChange(taker.id, "AVAILABLE")
                        }
                        variant="outline"
                      >
                        Mark Available
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
