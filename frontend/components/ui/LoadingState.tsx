export default function LoadingState({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}