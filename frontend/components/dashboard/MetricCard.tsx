interface Props {
  title: string;
  value: string | number;
}

export default function MetricCard({ title, value }: Props) {
  return (
    <div className="card p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}