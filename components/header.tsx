"use client"
import * as React from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useWeb3Modal } from '@web3modal/wagmi/react'

export function Header() {
  const { open } = useWeb3Modal()
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <span>WalletChat AI</span>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div
          className={cn(buttonVariants(), 'cursor-pointer')}
          onClick={() => open()}
        >
          <span className="hidden sm:block">connect wallet</span>
        </div>
      </div>
    </header>
  )
}