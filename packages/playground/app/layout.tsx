import type { Metadata, Viewport } from 'next';
import '@coinbase/onchainkit/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'WellSpace - Transform Your Wellness Journey',
  description: 'AI-powered wellness tracking with blockchain rewards. Connect your wallet, set goals, and earn $WELL tokens for healthy habits.',
  keywords: 'wellness, health, AI, blockchain, NFT, rewards, Web3, WellSpace',
  authors: [{ name: 'WellSpace Team' }],
  robots: 'index, follow',
  metadataBase: new URL('https://wellspace.app'),
  openGraph: {
    title: 'WellSpace - Transform Your Wellness Journey',
    description: 'AI-powered wellness tracking with blockchain rewards',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WellSpace - Transform Your Wellness Journey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WellSpace - Transform Your Wellness Journey',
    description: 'AI-powered wellness tracking with blockchain rewards',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sf-pro antialiased min-h-screen mobile-vh bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
