import { History } from "@/components/history/History";
import { Measure } from "@/components/measure/Measure";

export default function Home() {
  return (<div className="flex justify-center items-center h-screen flex-col gap-4">
    <Measure />
    <History />
  </div>
  );
}
