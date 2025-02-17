"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Registro } from "@/interfaces/Registro";
import { useRegistros } from "@/queries/registro";

const userId = '828f3131-98b2-4ca5-aef3-478b7abb2b3e';

export const History = () => {
  const { data, error, isLoading } = useRegistros(userId)

  return <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Pressão Sistólica</TableHead>
        <TableHead>Pressão Diastólica</TableHead>
        <TableHead>Data</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {isLoading ?
        <TableRow>
          <TableCell colSpan={3}>Carregando registros...</TableCell>
        </TableRow>
        : error ? (
          <TableRow>
            <TableCell colSpan={3}>Erro ao carregar registros: {JSON.stringify(error)}</TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3}>Nenhum registro encontrado.</TableCell>
          </TableRow>)
          : data.map((registro: Registro) => (
            <TableRow key={registro.id}>
              <TableCell>{registro.pressao_sistolica}</TableCell>
              <TableCell>{registro.pressao_diastolica}</TableCell>
              <TableCell>{new Date(registro.data_hora).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
    </TableBody>
  </Table>;
}