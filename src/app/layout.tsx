import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
    variable: "--font-rajdhani",
    subsets: ["latin"],
    weight: "700",
});

export const metadata: Metadata = {
    title: "Mini Dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`${rajdhani.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col px-4">{children}</body>
        </html>
    );
}
