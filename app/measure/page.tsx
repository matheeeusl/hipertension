import { Graph } from "@/components/graph/Graph";
import { Measure } from "@/components/measure/Measure";

export default function Home() {
  return (<div className="flex justify-center items-center h-screen flex-col gap-4">
    <Measure />
    {/* <History /> */}
    <div className="mt-4 max-w-3xl w-full">
      <Graph />
    </div>
  </div>
  );
}
