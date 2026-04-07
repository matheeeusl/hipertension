interface Props {
  text?: string;
  size?: "sm" | "md";
}

export const LoadingSpinner = ({ text, size = "md" }: Props) => {
  const spinnerSize = size === "sm" ? "h-5 w-5" : "h-8 w-8";
  return (
    <div className="flex justify-center items-center p-8 gap-2">
      <div className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-gray-900`} />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
};
