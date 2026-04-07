import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const PageContainer = ({ children }: Props) => (
  <div className="flex justify-center items-center min-h-screen flex-col gap-4 p-4">
    {children}
  </div>
);
