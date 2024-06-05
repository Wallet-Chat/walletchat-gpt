"use client"

import { assets } from '@/assets/assets'
import { Context } from '@/context/Context'
import Image from 'next/image'
import React, { KeyboardEvent, useContext } from 'react'
import './Form.css'
import Link from 'next/link'

const Form = () => {
    const {onSent, setInput, input} = useContext(Context);

    const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setInput("")
            await onSent();
        }
    };
  return (
    <div className='main-bottom'>
        <div className="search-box">
            <input 
                onChange={(e) => setInput(e.target.value)} 
                value={input} type="text" 
                placeholder='Enter a prompt here' 
                onKeyDown={(e) => handleKeyDown(e)}
            />
            <div>
                <Image src={assets.gallery_icon} alt="" />
                <Image src={assets.mic_icon} alt="" />
                {input ? <Image onClick={() => onSent()} src={assets.send_icon} alt="" /> : null}
            </div>
        </div>
        <p className="bottom-info">
            Conversational Blockchain Explorer and Token Analysis - contact <a href='https://x.com/wallet_chat?s=11' className='hover:underline' target='_blank'>@wallet_chat</a>  with feedback
        </p>
    </div>
  )
}

export default Form