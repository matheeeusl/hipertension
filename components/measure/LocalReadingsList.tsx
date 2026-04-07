"use client";

import Link from "next/link";
import { BloodPressure } from "@/interfaces/BloodPressure";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/contexts/LocaleContext";
import { BPCitationFooter } from "@/components/shared/BPCitationFooter";
import { ReadingTableRow } from "@/components/shared/ReadingTableRow";

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
            {readings.map((reading) => (
              <ReadingTableRow
                key={reading.id}
                reading={reading}
                categories={t.history.categories}
                dateFormat="HH:mm"
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
        <BPCitationFooter className="px-1" />
      </CardContent>
    </Card>
  );
};
