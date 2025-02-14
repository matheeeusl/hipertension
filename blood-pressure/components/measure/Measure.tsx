"use client"

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/utils/supabaseClient';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Esquema de validação com Zod
const MeasureSchema = z.object({
  pressao_sistolica: z.string().regex(/^\d+$/, 'A pressão sistólica deve conter apenas números').min(2, 'A pressão sistólica deve ter no mínimo 2 dígitos').max(3, 'A pressão sistólica deve ter no máximo 3 dígitos'),
  pressao_diastolica: z.string().regex(/^\d+$/, 'A pressão diastólica deve conter apenas números').min(2, 'A pressão diastólica deve ter no mínimo 2 dígitos').max(3, 'A pressão diastólica deve ter no máximo 3 dígitos'),
  anotacoes: z.string().optional(),
});

type MeasureFormData = z.infer<typeof MeasureSchema>;

export const Measure = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      const { error } = await supabase.from('Measures').insert([
        {
          ...data,
          data_hora: new Date(),
          usuario_id: 'id do usuário logado', // Substitua pelo ID do usuário logado
        },
      ]);

      if (error) {
        throw error;
      }

      setSuccess('Measure salvo com sucesso!');
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
          <div className="grid gap-4">
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
            <div>
              <Label htmlFor="anotacoes">Anotações (opcional)</Label>
              <Input type="text" id="anotacoes" {...register('anotacoes')} />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          </div>
          <CardFooter className="mt-4">
            <Button type="submit">Salvar Measure</Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};