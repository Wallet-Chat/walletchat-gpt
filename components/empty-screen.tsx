import { UseChatHelpers } from 'ai/react'
import Image from 'next/image'
import { assets } from '@/assets/assets';
import './Main/Main.css'

const prompts = [
  {
      id: 1,
      prompt: "Give the wallet address for crypto-kevin.eth?",
      icon: assets.compass_icon
  },
  {
      id: 2,
      prompt: "What is the token overlap for PEPE on Ethereum?",
      icon: assets.bulb_icon
  },
  {
      id: 3,
      prompt: "Use etherscan to call the function owner() on the Bored Ape YC smart contract, use proxy module and eth_call action",
      icon: assets.message_icon
  },
  {
      id: 4,
      prompt: 'get the portfolio for SOL wallet 8jnC8Zt9fpzUXUQQc12o1pwnJDZkixzLgWSPVJKpXEsK',
      icon: assets.code_icon
  },
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <>
      <div className="cards mt-40 hidden md:flex">
          {prompts?.map((item) => (
              <div className="card" onClick={() => setInput(item.prompt)} key={item.id}>
                  <p>{`${item.prompt.slice(0, 50)}...`}</p>
                  <Image src={item.icon} alt="" />
              </div>
          ))}
      </div>
    </>
  )
}