import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";
import { BloodPressureInput } from "@/interfaces/BloodPressure";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; id: string }> }
) {
  const { userId, id } = await params;
  const updates: Partial<BloodPressureInput> = await req.json();

  if (
    updates.systolic_pressure !== undefined &&
    (updates.systolic_pressure < 50 || updates.systolic_pressure > 300)
  ) {
    return NextResponse.json(
      { message: "Systolic pressure must be between 50 and 300" },
      { status: 400 }
    );
  }

  if (
    updates.diastolic_pressure !== undefined &&
    (updates.diastolic_pressure < 30 || updates.diastolic_pressure > 200)
  ) {
    return NextResponse.json(
      { message: "Diastolic pressure must be between 30 and 200" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("blood_pressure_readings")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ message: "Reading not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error updating blood pressure reading:", error);
    return NextResponse.json(
      { error: "Failed to update reading", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; id: string }> }
) {
  const { userId, id } = await params;

  try {
    const { error } = await supabase
      .from("blood_pressure_readings")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("Error deleting blood pressure reading:", error);
    return NextResponse.json(
      { error: "Failed to delete reading", details: (error as Error).message },
      { status: 500 }
    );
  }
}
