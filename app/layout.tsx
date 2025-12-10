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

/**
 * Wraps the application UI in the root HTML structure with global fonts, the Convex client provider, and analytics.
 *
 * Renders the top-level <html> and <body>, applies configured font CSS variables and classes, places `children` inside the ConvexClientProvider, and includes the Analytics component.
 *
 * @param children - The application content to render inside the root layout and Convex client provider.
 * @returns The root JSX element containing the HTML and body with providers and analytics.
 */
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