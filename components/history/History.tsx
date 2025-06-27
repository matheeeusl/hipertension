"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { useBloodPressure } from "@/hooks/useBloodPressure";
import { format } from "date-fns";
import { toast } from "sonner";

const userId = process.env.NEXT_PUBLIC_USER_ID || '';

export const History = () => {
  const { data, error, isLoading, deleteReading } = useBloodPressure(userId);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      try {
        await deleteReading(id);
        toast.success('Reading deleted successfully');
      } catch (error) {
        console.error('Error deleting reading:', error);
        toast.error('Failed to delete reading');
      }
    }
  };

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 90 || diastolic < 60) return { text: 'Low', color: 'text-blue-600' };
    if (systolic < 120 && diastolic < 80) return { text: 'Normal', color: 'text-green-600' };
    if (systolic < 130 && diastolic < 80) return { text: 'Elevated', color: 'text-yellow-600' };
    if (systolic < 140 || diastolic < 90) return { text: 'Stage 1', color: 'text-orange-600' };
    if (systolic < 180 || diastolic < 120) return { text: 'Stage 2', color: 'text-red-600' };
    return { text: 'Crisis', color: 'text-red-800 font-bold' };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading readings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error loading readings: {JSON.stringify(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Blood Pressure History</h3>
        <span className="text-sm text-gray-500">
          {data.length} reading{data.length !== 1 ? 's' : ''}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No readings found. Start by recording your first blood pressure measurement!
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Systolic</TableHead>
              <TableHead>Diastolic</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((reading: BloodPressure) => {
              const category = getBPCategory(reading.systolic_pressure, reading.diastolic_pressure);
              return (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">{reading.systolic_pressure}</TableCell>
                  <TableCell className="font-medium">{reading.diastolic_pressure}</TableCell>
                  <TableCell>
                    <span className={`text-sm ${category.color}`}>
                      {category.text}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(reading.recorded_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                    {reading.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reading.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};