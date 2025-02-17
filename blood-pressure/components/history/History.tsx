"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Registro } from "@/interfaces/Registro";
import { useRegistros } from "@/queries/registro";
import { format } from "date-fns";

const userId = process.env.NEXT_PUBLIC_USER_ID || '';

export const History = () => {
  const { data, error, isLoading } = useRegistros(userId)

  return <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Pressão Sistólica</TableHead>
        <TableHead>Pressão Diastólica</TableHead>
        <TableHead>Data</TableHead>
        <TableHead>Anotações</TableHead>
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
              <TableCell>{format(registro.data_hora, 'dd/MM/yyyy, HH:mm')}</TableCell>
              <TableCell>{registro.anotacoes}</TableCell>
            </TableRow>
          ))}
    </TableBody>
  </Table>;
}