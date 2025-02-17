import { useGetRegistrosQuery, useAddRegistroMutation } from '@/api/registrosApi';
import { Registro } from '@/interfaces/Registro';

export const useRegistros = (userId: string) => {
  const { data, isLoading, error } = useGetRegistrosQuery(userId);
  const [addRegistro, { isLoading: isAdding }] = useAddRegistroMutation();

  const addRegistroComUserId = async (registro: Partial<Registro>) => {
    try {
      await addRegistro({ registro, userId }).unwrap();
    } catch (error) {
      console.error(error);
    }
  }

  return { data, isLoading, error, addRegistro: addRegistroComUserId, isAdding };
};