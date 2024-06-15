'use client'

import dynamic from 'next/dynamic'
import { PriceSkeleton } from './price-skeleton'
import { PricesSkeleton } from './prices-skeleton'
import { EventsSkeleton } from './events-skeleton'

export { spinner } from './spinner'
export { BotCard, BotMessage, SystemMessage } from './message'

const Price = dynamic(() => import('./price').then(mod => mod.Price), {
  ssr: false,
  loading: () => <PriceSkeleton />
})

const Purchase = dynamic(
  () => import('./crypto-purchase').then(mod => mod.Purchase),
  {
    ssr: false,
    loading: () => (
      <div className="h-[375px] rounded-xl border bg-zinc-950 p-4 text-green-400 sm:h-[314px]" />
    )
  }
)

const Prices = dynamic(() => import('./prices').then(mod => mod.Prices), {
  ssr: false,
  loading: () => <PricesSkeleton />
})

const Events = dynamic(() => import('./events').then(mod => mod.Events), {
  ssr: false,
  loading: () => <EventsSkeleton />
})

export { Price, Purchase, Prices, Events }
