'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base, baseGoerli } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createConfig, http } from 'wagmi'
import { coinbaseWallet } from 'wagmi/connectors'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

// Create Wagmi config
const config = createConfig({
  chains: [base, baseGoerli],
  connectors: [
    coinbaseWallet({
      appName: 'Wellness App',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseGoerli.id]: http(),
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <OnchainKitProvider
              apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
              chain={baseGoerli}
            >
              {children}
            </OnchainKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}

