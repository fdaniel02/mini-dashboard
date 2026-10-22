import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({
    variable: "--font-roboto-mono",
    subsets: ["latin"],
    weight: "500",
});

export const metadata: Metadata = {
    title: "Mini Dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`${robotoMono.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col px-4">{children}</body>
        </html>
    );
}
