import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "DevBoard · GitHub Intelligence",
  description: "Analyze GitHub profiles, repository quality, activity, languages and engineering health.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" suppressHydrationWarning><body><ThemeProvider attribute="class" defaultTheme="dark" enableSystem>{children}</ThemeProvider></body></html>;
}
