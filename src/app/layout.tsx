import type { Metadata } from "next";
import { Inter, Indie_Flower } from "next/font/google";
import "./globals.css";
import AIChatbot from "@/components/AIChatbot";
import FloatingDecorations from "@/components/FloatingDecorations";

const inter = Inter({ subsets: ["latin"] });
const indieFlower = Indie_Flower({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-indie-flower"
});

export const metadata: Metadata = {
  title: "AcademyAI - AI-Powered Remote Learning",
  description: "AI-powered remote classroom platform with live virtual sessions, interactive learning, and intelligent features for modern education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <FloatingDecorations />
        {children}
        <AIChatbot />
      </body>
    </html>
  );
}
