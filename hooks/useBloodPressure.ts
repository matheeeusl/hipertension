import {
  useGetBloodPressureReadingsQuery,
  useAddBloodPressureReadingMutation,
  useUpdateBloodPressureReadingMutation,
  useDeleteBloodPressureReadingMutation,
} from "@/api/bloodPressureApi";
import { BloodPressureInput } from "@/interfaces/BloodPressure";

export const useBloodPressure = (userId: string) => {
  const { data, isLoading, error } = useGetBloodPressureReadingsQuery(userId, { skip: !userId });
  const [addReading, { isLoading: isAdding }] =
    useAddBloodPressureReadingMutation();
  const [updateReading, { isLoading: isUpdating }] =
    useUpdateBloodPressureReadingMutation();
  const [deleteReading, { isLoading: isDeleting }] =
    useDeleteBloodPressureReadingMutation();

  const addReadingWithUserId = async (reading: BloodPressureInput) => {
    try {
      await addReading({ reading, userId }).unwrap();
    } catch (error) {
      console.error("Error adding blood pressure reading:", error);
      throw new Error("Failed to add blood pressure reading");
    }
  };

  const updateReadingWithUserId = async (
    id: string,
    reading: Partial<BloodPressureInput>
  ) => {
    try {
      await updateReading({ id, reading, userId }).unwrap();
    } catch (error) {
      console.error("Error updating blood pressure reading:", error);
      throw new Error("Failed to update blood pressure reading");
    }
  };

  const deleteReadingWithUserId = async (id: string) => {
    try {
      await deleteReading({ id, userId }).unwrap();
    } catch (error) {
      console.error("Error deleting blood pressure reading:", error);
      throw new Error("Failed to delete blood pressure reading");
    }
  };

  return {
    data: data || [],
    isLoading,
    error,
    addReading: addReadingWithUserId,
    updateReading: updateReadingWithUserId,
    deleteReading: deleteReadingWithUserId,
    isAdding,
    isUpdating,
    isDeleting,
  };
};
