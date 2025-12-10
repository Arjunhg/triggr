import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";


const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Agentic Workflows",
  description: "Form workflows seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body
          className={`${playfair.variable} ${cormorant.variable} antialiased font-playfair`}
        >
              <ConvexClientProvider>
                {children}
              </ConvexClientProvider>
              <Analytics/>
        </body>
      </html>
  );
}