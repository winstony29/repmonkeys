import type { Metadata } from 'next';
import '@coinbase/onchainkit/styles.css';
import './globals.css';

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
      <body className="font-sf-pro">{children}</body>
    </html>
  );
}
