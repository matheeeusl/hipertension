export interface Registro {
  id: string;
  pressao_sistolica: number;
  pressao_diastolica: number;
  data_hora: string;
  anotacoes?: string;
  tags?: string[] | null;
  usuario_id: string;
}