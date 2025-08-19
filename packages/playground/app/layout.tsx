import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@coinbase/onchainkit/styles.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OnchainKit App - Build the Future On-Chain',
  description: 'Experience the power of OnchainKit with seamless wallet connections, instant transactions, and powerful Web3 integrations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
