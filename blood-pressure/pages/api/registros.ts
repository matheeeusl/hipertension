import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if(!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'ID do usuário é inválido' });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('usuario_id', userId) 
        .order('data_hora', { ascending: false });

      if (error) {
        throw error;
      }

      res.status(200).json(data);
    } catch (error: unknown) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else if (req.method === 'POST') {
    try {
      const registro = req.body;

      const { data, error } = await supabase.from('registros').insert([
        {
          ...registro,
          data_hora: new Date(),
          usuario_id: userId,
        },
      ]);

      if (error) {
        throw error;
      }

      res.status(201).json(data?.[0]);
    } catch (error: unknown) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}