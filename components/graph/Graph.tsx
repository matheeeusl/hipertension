"use client";

import { useRegistros } from "@/queries/registro";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
import { transformRegistro } from "@/utils/chart";

const userId = process.env.NEXT_PUBLIC_USER_ID || '';

export const Graph = () => {
  const { data, error, isLoading } = useRegistros(userId);

  const chartConfig = {
    systolic: {
      label: 'Pressão Sistólica',
      color: 'rgb(255, 99, 132)',
    },
    diastolic: {
      label: 'Pressão Diastólica',
      color: 'rgb(54, 162, 235)',
    },
    note: {
      label: 'Anotações',
      color: 'rgb(75, 192, 192)',
    }
  } satisfies ChartConfig;

  return (
    <div>
      {isLoading ?
        <p>Carregando registros...</p>
        : error ? (
          <p>Erro ao carregar registros: {JSON.stringify(error)}</p>
        ) : data.length === 0 ? (
          <p>Nenhum registro encontrado.</p>
        ) : (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Gráfico de Pressão Arterial</h3>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart accessibilityLayer data={transformRegistro(data)}>
                  <CartesianGrid vertical={true} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={true}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line
                    dataKey="systolic"
                    type="linear"
                    stroke="rgb(54, 162, 235)"
                    strokeWidth={2}
                    dot={{
                      fill: "rgb(54, 162, 235)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line>
                  <Line
                    dataKey="diastolic"
                    type="linear"
                    stroke="rgb(255, 99, 132)"
                    strokeWidth={2}
                    dot={{
                      fill: "rgb(255, 99, 132)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line>
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
    </div>
  );
};