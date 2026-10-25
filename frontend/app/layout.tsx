import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata = {
  title: "AgeShield",
  description: "AI Agent Security Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}