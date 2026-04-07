import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";
import { BloodPressureInput } from "@/interfaces/BloodPressure";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const { data, error } = await supabase
      .from("blood_pressure_readings")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    console.error("Error fetching blood pressure readings:", error);
    return NextResponse.json(
      { error: "Failed to fetch readings", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const reading: BloodPressureInput = await req.json();

  if (!reading.systolic_pressure || !reading.diastolic_pressure) {
    return NextResponse.json(
      { message: "Systolic and diastolic pressure are required" },
      { status: 400 }
    );
  }

  if (reading.systolic_pressure < 50 || reading.systolic_pressure > 300) {
    return NextResponse.json(
      { message: "Systolic pressure must be between 50 and 300" },
      { status: 400 }
    );
  }

  if (reading.diastolic_pressure < 30 || reading.diastolic_pressure > 200) {
    return NextResponse.json(
      { message: "Diastolic pressure must be between 30 and 200" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("blood_pressure_readings")
      .insert([
        {
          systolic_pressure: reading.systolic_pressure,
          diastolic_pressure: reading.diastolic_pressure,
          notes: reading.notes ?? null,
          tags: reading.tags ?? null,
          user_id: userId,
          recorded_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating blood pressure reading:", error);
    return NextResponse.json(
      { error: "Failed to create reading", details: (error as Error).message },
      { status: 500 }
    );
  }
}
