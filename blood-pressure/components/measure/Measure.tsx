"use client"

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRegistros } from '@/queries/registro';

// Esquema de validação com Zod
const MeasureSchema = z.object({
  pressao_sistolica: z.string().regex(/^\d+$/, 'A pressão sistólica deve conter apenas números').min(2, 'A pressão sistólica deve ter no mínimo 2 dígitos').max(3, 'A pressão sistólica deve ter no máximo 3 dígitos'),
  pressao_diastolica: z.string().regex(/^\d+$/, 'A pressão diastólica deve conter apenas números').min(2, 'A pressão diastólica deve ter no mínimo 2 dígitos').max(3, 'A pressão diastólica deve ter no máximo 3 dígitos'),
  anotacoes: z.string().optional(),
});

type MeasureFormData = z.infer<typeof MeasureSchema>;

const userId = '828f3131-98b2-4ca5-aef3-478b7abb2b3e';

export const Measure = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addRegistro, isAdding } = useRegistros(userId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MeasureFormData>({
    resolver: zodResolver(MeasureSchema),
  });

  const onSubmit: SubmitHandler<MeasureFormData> = async (data) => {
    setError(null);
    setSuccess(null);

    try {
      const registro = {
        pressao_sistolica: parseInt(data.pressao_sistolica, 10),
        pressao_diastolica: parseInt(data.pressao_diastolica, 10),
        anotacoes: data.anotacoes,
        data_hora: new Date().toISOString(),
        usuario_id: userId
      }
      await addRegistro(registro);
      setSuccess('Medida salva com sucesso!');
    } catch (error: unknown) {
      setError((error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Registrar Pressão Arterial</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div className='flex gap-4'>
              <div>
                <Label htmlFor="pressao_sistolica">Pressão Sistólica</Label>
                <Input
                  type="number"
                  id="pressao_sistolica"
                  {...register('pressao_sistolica')}
                />
                {errors.pressao_sistolica && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.pressao_sistolica.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="pressao_diastolica">Pressão Diastólica</Label>
                <Input
                  type="number"
                  id="pressao_diastolica"
                  {...register('pressao_diastolica')}
                />
                {errors.pressao_diastolica && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.pressao_diastolica.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="anotacoes">Anotações (opcional)</Label>
              <Input type="text" id="anotacoes" {...register('anotacoes')} />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          </div>
          <CardFooter className="mt-4 p-0">
            <Button type="submit" disabled={isAdding}>{isAdding ? 'Salvando...' : 'Salvar Measure'}</Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};