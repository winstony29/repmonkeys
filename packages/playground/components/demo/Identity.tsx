import {
  Address,
  Avatar,
  Badge,
  Identity,
  Name,
  Socials,
} from '@coinbase/onchainkit/identity';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { baseSepolia } from 'viem/chains';
import { useAccount } from 'wagmi';

export default function IdentityDemo() {
  const { address } = useAccount();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="relative">
        {address ? (
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <h2 className="font-medium text-gray-500 text-sm">
                Base Sepolia Testnet
              </h2>
              <div className="flex items-center space-x-4">
                <Identity address={address} chain={baseSepolia}>
                  <Avatar />
                  <Name>
                    <Badge />
                  </Name>
                  <Address />
                  <Socials />
                </Identity>
              </div>
            </div>
          </div>
        ) : (
          <ConnectWallet />
        )}
      </div>
    </div>
  );
}
