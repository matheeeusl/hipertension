"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/contexts/LocaleContext";
import { getBPCategory } from "@/utils/bpCategory";

interface Props {
  readings: BloodPressure[];
  onDelete: (id: string) => void;
}

export const LocalReadingsList = ({ readings, onDelete }: Props) => {
  const { t } = useLocale();

  if (readings.length === 0) return null;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t.localReadings.title}</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {readings.length} {readings.length !== 1 ? t.history.readings : t.history.reading} — {t.localReadings.notSaved}
            </span>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              {t.localReadings.logIn}
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.localReadings.columns.systolic}</TableHead>
              <TableHead>{t.localReadings.columns.diastolic}</TableHead>
              <TableHead>{t.localReadings.columns.category} *</TableHead>
              <TableHead>{t.localReadings.columns.time}</TableHead>
              <TableHead>{t.localReadings.columns.notes}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.map((reading) => {
              const category = getBPCategory(
                reading.systolic_pressure,
                reading.diastolic_pressure,
                t.history.categories
              );
              return (
                <TableRow key={reading.id}>
                  <TableCell className="font-medium">{reading.systolic_pressure}</TableCell>
                  <TableCell className="font-medium">{reading.diastolic_pressure}</TableCell>
                  <TableCell>
                    <span className={`text-sm ${category.color}`}>{category.text}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(reading.recorded_at), "HH:mm")}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                    {reading.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(reading.id)}
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
        <p className="text-xs text-gray-400 mt-2 px-1">
          * Whelton PK, et al. 2017 ACC/AHA Guideline for the Prevention,
          Detection, Evaluation, and Management of High Blood Pressure in
          Adults. <em>J Am Coll Cardiol.</em> 2018;71(19):e127–e248.{" "}
          <a
            href="https://doi.org/10.1016/j.jacc.2017.11.006"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            doi:10.1016/j.jacc.2017.11.006
          </a>
        </p>
      </CardContent>
    </Card>
  );
};
