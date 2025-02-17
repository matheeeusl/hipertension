import { Registro } from "@/interfaces/Registro";
import { format } from "date-fns/format";

export const transformRegistro = (registros: Registro[]) => {
  if(!registros) return [];
  
  const registrosTratados = registros.map((registro) => {
    return {
      date: format(registro.data_hora, 'dd/MM HH:mm'),
      systolic: registro.pressao_sistolica,
      diastolic: registro.pressao_diastolica,
      note: registro.anotacoes
    };
  });

  return registrosTratados;
}