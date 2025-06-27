import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabaseClient";
import { BloodPressureInput } from "@/interfaces/BloodPressure";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { params } = req.query;

  if (!params || !Array.isArray(params) || params.length === 0) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const [userId, readingId] = params;

  if (!userId || typeof userId !== "string") {
    return res
      .status(400)
      .json({ message: "User ID is required and must be a string" });
  }

  switch (req.method) {
    case "GET":
      return handleGet(req, res, userId);
    case "POST":
      return handlePost(req, res, userId);
    case "PUT":
      return handlePut(req, res, userId, readingId);
    case "DELETE":
      return handleDelete(req, res, userId, readingId);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

// GET: Fetch all readings for a user
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from("blood_pressure_readings")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error: unknown) {
    console.error("Error fetching blood pressure readings:", error);
    res.status(500).json({
      error: "Failed to fetch readings",
      details: (error as Error).message,
    });
  }
}

// POST: Create a new reading
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const reading: BloodPressureInput = req.body;

    // Validate required fields
    if (!reading.systolic_pressure || !reading.diastolic_pressure) {
      return res.status(400).json({
        message: "Systolic and diastolic pressure are required",
      });
    }

    // Validate pressure ranges
    if (reading.systolic_pressure < 50 || reading.systolic_pressure > 300) {
      return res.status(400).json({
        message: "Systolic pressure must be between 50 and 300",
      });
    }

    if (reading.diastolic_pressure < 30 || reading.diastolic_pressure > 200) {
      return res.status(400).json({
        message: "Diastolic pressure must be between 30 and 200",
      });
    }

    const { data, error } = await supabase
      .from("blood_pressure_readings")
      .insert([
        {
          systolic_pressure: reading.systolic_pressure,
          diastolic_pressure: reading.diastolic_pressure,
          notes: reading.notes || null,
          tags: reading.tags || null,
          user_id: userId,
          recorded_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: unknown) {
    console.error("Error creating blood pressure reading:", error);
    res.status(500).json({
      error: "Failed to create reading",
      details: (error as Error).message,
    });
  }
}

// PUT: Update an existing reading
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  readingId?: string
) {
  if (!readingId) {
    return res
      .status(400)
      .json({ message: "Reading ID is required for updates" });
  }

  try {
    const updates: Partial<BloodPressureInput> = req.body;

    // Validate pressure ranges if provided
    if (
      updates.systolic_pressure &&
      (updates.systolic_pressure < 50 || updates.systolic_pressure > 300)
    ) {
      return res.status(400).json({
        message: "Systolic pressure must be between 50 and 300",
      });
    }

    if (
      updates.diastolic_pressure &&
      (updates.diastolic_pressure < 30 || updates.diastolic_pressure > 200)
    ) {
      return res.status(400).json({
        message: "Diastolic pressure must be between 30 and 200",
      });
    }

    const { data, error } = await supabase
      .from("blood_pressure_readings")
      .update(updates)
      .eq("id", readingId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Reading not found" });
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error("Error updating blood pressure reading:", error);
    res.status(500).json({
      error: "Failed to update reading",
      details: (error as Error).message,
    });
  }
}

// DELETE: Delete a reading
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  readingId?: string
) {
  if (!readingId) {
    return res
      .status(400)
      .json({ message: "Reading ID is required for deletion" });
  }

  try {
    const { error } = await supabase
      .from("blood_pressure_readings")
      .delete()
      .eq("id", readingId)
      .eq("user_id", userId);

    if (error) throw error;

    res.status(204).end();
  } catch (error: unknown) {
    console.error("Error deleting blood pressure reading:", error);
    res.status(500).json({
      error: "Failed to delete reading",
      details: (error as Error).message,
    });
  }
}
