"use client"
import * as React from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import { toast } from "react-toastify";
import axios from "axios";

export function Header() {
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  React.useEffect(() => {
    connectWallet();
  }, [isConnected, address])

  const connectWallet = async () => {
    try {
      const response = await axios.post('/api/connectWallet', { walletAddress: address });
      console.log(`Wallet connected: ${address}`);
    } catch (error) {
      toast.error("Failed to connect wallet.");
      console.log("Error connecting wallet:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <span>WalletChat AI</span>
      </div>
      <div className="flex items-center justify-end space-x-2">
        {!isConnected && (
          <div
            className={cn(buttonVariants(), 'cursor-pointer')}
            onClick={() => open()}
          >
            <span className="text-white">connect wallet</span>
          </div>
        )}
        {isConnected && (
          <div className={cn(buttonVariants(), 'cursor-pointer')} onClick={() => disconnect()}>
            <span className="text-white">{`${address?.slice(0, 7)}...${address?.slice(35)}`}</span>
          </div>
        )}
      </div>
    </header>
  )
}