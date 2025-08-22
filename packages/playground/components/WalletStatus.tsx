'use client';

import { useAccount, useDisconnect, useChainId } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WalletStatus() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const getConnectionStatus = () => {
    if (isConnecting) return { status: 'connecting', text: 'Connecting...', color: 'bg-yellow-500' };
    if (isConnected) return { status: 'connected', text: 'Connected', color: 'bg-green-500' };
    if (isDisconnected) return { status: 'disconnected', text: 'Disconnected', color: 'bg-red-500' };
    return { status: 'unknown', text: 'Unknown', color: 'bg-gray-500' };
  };

  const { status, text, color } = getConnectionStatus();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wallet className="w-4 h-4" />
          Wallet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <Badge variant="outline" className="text-xs">
              {text}
            </Badge>
          </div>
        </div>

        {/* Address */}
        {address && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Address:</span>
            <span className="text-xs font-mono text-gray-800 truncate max-w-32">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        )}

        {/* Chain ID */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Chain ID:</span>
          <Badge variant="outline" className="text-xs">
            {chainId || 'Unknown'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {isConnected && (
            <Button 
              onClick={handleDisconnect} 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              Disconnect
            </Button>
          )}
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Debug Info */}
        <div className="pt-2 border-t text-xs text-gray-500">
          <div>isConnecting: {isConnecting.toString()}</div>
          <div>isConnected: {isConnected.toString()}</div>
          <div>isDisconnected: {isDisconnected.toString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}

