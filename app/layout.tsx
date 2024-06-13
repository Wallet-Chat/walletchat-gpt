import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from 'next/headers'
import "./globals.css";
import ContextProvider from "@/context/Context";
import Web3ModalProvider from "@/context/Wagmi";
import { config } from '@/config/wagmi'
import { cookieToInitialState } from 'wagmi'
import { Providers } from '@/components/providers'
import { Header } from "@/components/header";
// import Header from "@/components/Common/Header";

export const metadata: Metadata = {
  title: "WalletChat AI",
  description: "Conversational Blockchain explorer and Token analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get('cookie'))
  return (
    <html lang="en" suppressHydrationWarning>
    <head />
    <body>
      <Web3ModalProvider initialState={initialState}>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <ContextProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex flex-1 flex-col bg-muted/50">{children}</main>
            </div>
          </ContextProvider>
        </Providers>
      </Web3ModalProvider>
    </body>
  </html>
  );
}