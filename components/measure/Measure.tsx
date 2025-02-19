"use client"

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
import { toast, Toaster } from 'sonner';
import { cn } from '@/lib/utils';

const MeasureSchema = z.object({
  pressao_sistolica: z.string().regex(/^\d+$/, 'A pressão sistólica deve conter apenas números').min(2, 'A pressão sistólica deve ter no mínimo 2 dígitos').max(3, 'A pressão sistólica deve ter no máximo 3 dígitos'),
  pressao_diastolica: z.string().regex(/^\d+$/, 'A pressão diastólica deve conter apenas números').min(2, 'A pressão diastólica deve ter no mínimo 2 dígitos').max(3, 'A pressão diastólica deve ter no máximo 3 dígitos'),
  anotacoes: z.string().optional(),
});

type MeasureFormData = z.infer<typeof MeasureSchema>;

const userId = process.env.NEXT_PUBLIC_USER_ID || '';

export const Measure = () => {
  const { addRegistro, isAdding } = useRegistros(userId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MeasureFormData>({
    resolver: zodResolver(MeasureSchema),
  });

  const onSubmit: SubmitHandler<MeasureFormData> = async (data) => {

    const registro = {
      pressao_sistolica: parseInt(data.pressao_sistolica, 10),
      pressao_diastolica: parseInt(data.pressao_diastolica, 10),
      anotacoes: data.anotacoes,
      data_hora: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      usuario_id: userId
    }

    try {
      await addRegistro(registro);
      toast.success('Medida salva com sucesso!');
    } catch (error: unknown) {
      toast.error(
        "Uh oh! Something went wrong.",
        { description: (error as Error).message }
      );
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
              <div className="max-w-44 mb-4">
                <Label htmlFor="pressao_sistolica">Pressão Sistólica (Alta)</Label>
                <Input
                  type="number"
                  id="pressao_sistolica"
                  className={
                    cn("w-100",
                      errors.pressao_sistolica && "border-red-500"
                    )
                  }
                  {...register('pressao_sistolica')}
                />
                {errors.pressao_sistolica && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.pressao_sistolica.message}
                  </p>
                )}
              </div>
              <div className="max-w-44 mb-4">
                <Label htmlFor="pressao_diastolica">Pressão Diastólica (Baixa)</Label>
                <Input
                  type="number"
                  id="pressao_diastolica"
                  className={
                    cn("w-100",
                      errors.pressao_diastolica && "border-red-500"
                    )
                  }
                  {...register('pressao_diastolica')}
                />
                {errors.pressao_diastolica && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.pressao_diastolica.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="anotacoes">Anotações (opcional)</Label>
              <Input type="text" id="anotacoes" {...register('anotacoes')} />
            </div>
            <Toaster richColors />
          </div>
          <CardFooter className="mt-4 p-0">
            <Button type="submit" disabled={isAdding}>
              {
                isAdding ?
                'Salvando...' : 
                'Salvar Measure'
              }
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};