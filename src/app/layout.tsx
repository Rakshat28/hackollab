
import "~/styles/globals.css";
import {ClerkProvider} from "@clerk/nextjs";
import { ThemeProvider } from "~/components/theme-provider"
import { ProjectProvider } from "~/context/ProjectContext";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "sonner";

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
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        
      <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange>
      <ClerkProvider>
        <ProjectProvider>

            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster richColors/>

          </ProjectProvider>
      </ClerkProvider>
    </ThemeProvider>
      </body>
    </html>

  );
}
