import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import { ToastProvider } from "@/context/ToastContext";
import { CompareCollegesProvider } from "@/context/CompareCollegesContext";
import PageWrapper from "@/components/PageWrapper";
import Navbar from "@/components/Navbar";
import ToastContainer from "@/components/ToastContainer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PolyHub | ECET Resource Hub",
  description: "A premium, mobile-friendly learning hub for ECET and polytechnic students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <AdminProvider>
              <CompareCollegesProvider>
                <Navbar />
                <ToastContainer />
                <div className="pt-20">
                  <PageWrapper>{children}</PageWrapper>
                </div>
              </CompareCollegesProvider>
            </AdminProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
