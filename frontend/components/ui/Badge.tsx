export default function Badge({
  children,
  type = "default",
}: {
  children: React.ReactNode;
  type?: "default" | "success" | "warning" | "danger";
}) {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[type]}`}
    >
      {children}
    </span>
  );
}