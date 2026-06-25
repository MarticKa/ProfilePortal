import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Profile Portal", description: "A small profile management portal" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="cs"><body><header><a href="/" className="brand">Profile Portal</a></header><main>{children}</main></body></html>;
}
