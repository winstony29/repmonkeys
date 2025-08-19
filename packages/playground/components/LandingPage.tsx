'use client';

import { useState } from 'react';
import {
  Avatar,
  Name,
  Identity,
  EthBalance,
  Address,
} from '@coinbase/onchainkit/identity';
import {
  Wallet,
  ConnectWallet,
} from '@coinbase/onchainkit/wallet';
import { FundButton } from '@coinbase/onchainkit/fund';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';

const features = [
  {
    title: 'Connect & Authenticate',
    description: 'Seamlessly connect wallets and verify user identity with built-in ENS and Basename support.',
    icon: '🔗',
  },
  {
    title: 'Fast Transactions',
    description: 'Execute blockchain transactions with ease using sponsored transactions and smart contract interactions.',
    icon: '⚡',
  },
  {
    title: 'Token Swaps',
    description: 'Swap tokens directly within your app with the best rates and minimal slippage.',
    icon: '🔄',
  },
  {
    title: 'Fund Wallets',
    description: 'Help users fund their wallets through multiple payment methods including credit cards and bank transfers.',
    icon: '💰',
  },
];

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { address } = useAccount();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100', 
      isDarkMode && 'from-gray-900 to-indigo-900')}>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                OnchainKit App
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <Wallet>
                <ConnectWallet>
                  {address && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8" />
                      <Name />
                    </div>
                  )}
                </ConnectWallet>
              </Wallet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8">
              Build the Future
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                On-Chain
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              Experience the power of OnchainKit with seamless wallet connections, 
              instant transactions, and powerful Web3 integrations.
            </p>
            
            {/* Interactive Demo Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto mb-16">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Try it now
              </h3>
              
              <div className="space-y-6">
                {/* Wallet Connection */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Connect Your Wallet
                  </h4>
                  {address ? (
                    <Identity address={address}>
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12" />
                        <div className="flex flex-col">
                          <Name className="text-lg font-medium" />
                          <Address className="text-sm text-gray-500" />
                          <EthBalance />
                        </div>
                      </div>
                    </Identity>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Wallet>
                        <ConnectWallet />
                      </Wallet>
                    </div>
                  )}
                </div>

                {/* Fund Wallet */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Fund Your Wallet
                  </h4>
                  <FundButton />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a 
                    href="/demo" 
                    className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
                  >
                    Try Demo
                  </a>
                  <button className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                    View Components
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to build amazing Web3 experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10M+</div>
              <div className="text-xl opacity-90">Transactions Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-xl opacity-90">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-xl opacity-90">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of developers building the future of Web3
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/demo" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Try Interactive Demo
            </a>
            <a 
              href="https://onchainkit.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold rounded-lg transition-colors text-center"
            >
              View Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                OnchainKit App
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Building the future of decentralized applications.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Guides</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Community</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2024 OnchainKit App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
