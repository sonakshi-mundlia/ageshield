export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        —
      </div>

      <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>

      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}