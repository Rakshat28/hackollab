import "~/styles/globals.css";
import {ClerkProvider} from "@clerk/nextjs";
import { ThemeProvider } from "~/components/theme-provider"

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Hackollab",
  description: "Collaborate with ease",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange>
      <ClerkProvider>
        <html lang="en" className={`${geist.variable}`}>
          <body>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </body>
        </html>
      </ClerkProvider>
    </ThemeProvider>

  );
}
