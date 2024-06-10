import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      Conversational Blockchain Explorer and Token Analysis - contact {' '}
      <ExternalLink href="https://x.com/wallet_chat?s=11">@wallet_chat</ExternalLink>{' '}
      with feedback.
    </p>
  )
}