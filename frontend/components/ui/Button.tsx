interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const styles = {
    primary: "bg-red-500 text-white hover:bg-red-600",
    secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`rounded-lg px-4 py-2 font-semibold ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}