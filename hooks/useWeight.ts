import {
  useGetWeightReadingsQuery,
  useAddWeightReadingMutation,
  useUpdateWeightReadingMutation,
  useDeleteWeightReadingMutation,
} from "@/api/weightApi";
import { WeightInput } from "@/interfaces/Weight";

export const useWeight = (userId: string) => {
  const { data, isLoading, error } = useGetWeightReadingsQuery(userId, { skip: !userId });
  const [addReading, { isLoading: isAdding }] = useAddWeightReadingMutation();
  const [updateReading, { isLoading: isUpdating }] = useUpdateWeightReadingMutation();
  const [deleteReading, { isLoading: isDeleting }] = useDeleteWeightReadingMutation();

  const addReadingWithUserId = async (reading: WeightInput) => {
    try {
      await addReading({ reading, userId }).unwrap();
    } catch (error) {
      console.error("Error adding weight reading:", error);
      throw new Error("Failed to add weight reading");
    }
  };

  const updateReadingWithUserId = async (id: string, reading: Partial<WeightInput>) => {
    try {
      await updateReading({ id, reading, userId }).unwrap();
    } catch (error) {
      console.error("Error updating weight reading:", error);
      throw new Error("Failed to update weight reading");
    }
  };

  const deleteReadingWithUserId = async (id: string) => {
    try {
      await deleteReading({ id, userId }).unwrap();
    } catch (error) {
      console.error("Error deleting weight reading:", error);
      throw new Error("Failed to delete weight reading");
    }
  };

  return {
    data: data ?? [],
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
