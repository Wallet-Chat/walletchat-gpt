"use client"
import "./Main.css"
import Header from '../Common/Header';
import { Chat } from '../chat';
import { nanoid } from '@/lib/utils'

const Main = () => {
    const id = nanoid()

  return (
    <div className='main'>
        <Header />
        <div className="main-container">
            <div className="main-bottom">
                <Chat id={id} />
            </div>
        </div>
    </div>
  )
}

export default Main