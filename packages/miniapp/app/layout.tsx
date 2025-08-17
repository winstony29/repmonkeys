import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base, baseGoerli } from 'viem/chains'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wellness App - Decentralized Health on Base',
  description: 'AI-powered wellness application with NFT profiles and $WELL tokens on Base blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OnchainKitProvider
          initialChainId={baseGoerli.id}
          supportedChains={[base, baseGoerli]}
          rpcUrl="https://goerli.base.org"
          // Add your RPC provider API key here
          // rpcUrl="https://base-goerli.g.alchemy.com/v2/YOUR_API_KEY"
        >
          {children}
        </OnchainKitProvider>
      </body>
    </html>
  )
}

