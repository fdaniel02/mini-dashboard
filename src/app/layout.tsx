import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
    variable: "--font-ibm-plex-mono",
    subsets: ["latin"],
    weight: "700",
});

export const metadata: Metadata = {
    title: "Mini Dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`${ibmPlexMono.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col px-4">{children}</body>
        </html>
    );
}
