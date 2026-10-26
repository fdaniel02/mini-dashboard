import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
    variable: "--font-lato",
    subsets: ["latin"],
    weight: "900",
});

export const metadata: Metadata = {
    title: "Mini Dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`${lato.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col px-4">{children}</body>
        </html>
    );
}
