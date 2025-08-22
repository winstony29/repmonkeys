import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

export default (phase) => {
  const isProdBuild = phase === PHASE_PRODUCTION_BUILD;
  const isVercelProd = process.env.VERCEL_ENV === 'production';
  const assetPrefix =
    isProdBuild && isVercelProd ? 'https://onchainkit.xyz/playground' : '';

  // Debug environment variables during build
  console.log('🔍 Next.js Config - Environment Variables Debug:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - Phase:', phase);
  
  const requiredVars = [
    'NEXT_PUBLIC_WELLNESS_NFT_ADDRESS',
    'NEXT_PUBLIC_WELL_TOKEN_ADDRESS',
    'NEXT_PUBLIC_REWARDS_ADDRESS',
    'NEXT_PUBLIC_USER_PROFILE_ADDRESS',
    'NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS'
  ];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`  - ${varName}: ${value ? `${value.slice(0, 10)}...` : 'UNDEFINED'}`);
  });

  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    assetPrefix,
    typescript: {
      ignoreBuildErrors: true,
    },
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: (config) => {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
      return config;
    },
  };
  return nextConfig;
};
