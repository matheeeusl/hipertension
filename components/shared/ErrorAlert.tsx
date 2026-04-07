interface Props {
  message: string;
}

export const ErrorAlert = ({ message }: Props) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
    <p className="text-sm text-red-700">{message}</p>
  </div>
);
