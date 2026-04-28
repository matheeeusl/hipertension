import {
  useGetTemperatureReadingsQuery,
  useAddTemperatureReadingMutation,
  useUpdateTemperatureReadingMutation,
  useDeleteTemperatureReadingMutation,
} from "@/api/temperatureApi";
import { TemperatureInput } from "@/interfaces/Temperature";

export const useTemperature = (userId: string) => {
  const { data, isLoading, error } = useGetTemperatureReadingsQuery(userId, { skip: !userId });
  const [addReading, { isLoading: isAdding }] = useAddTemperatureReadingMutation();
  const [updateReading, { isLoading: isUpdating }] = useUpdateTemperatureReadingMutation();
  const [deleteReading, { isLoading: isDeleting }] = useDeleteTemperatureReadingMutation();

  const addReadingWithUserId = async (reading: TemperatureInput) => {
    try {
      await addReading({ reading, userId }).unwrap();
    } catch (error) {
      console.error("Error adding temperature reading:", error);
      throw new Error("Failed to add temperature reading");
    }
  };

  const updateReadingWithUserId = async (id: string, reading: Partial<TemperatureInput>) => {
    try {
      await updateReading({ id, reading, userId }).unwrap();
    } catch (error) {
      console.error("Error updating temperature reading:", error);
      throw new Error("Failed to update temperature reading");
    }
  };

  const deleteReadingWithUserId = async (id: string) => {
    try {
      await deleteReading({ id, userId }).unwrap();
    } catch (error) {
      console.error("Error deleting temperature reading:", error);
      throw new Error("Failed to delete temperature reading");
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
