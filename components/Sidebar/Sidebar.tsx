"use client"
import { useContext, useState } from 'react';
import  "./Sidebar.css"
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context';
import Image from 'next/image';
import Link from 'next/link';

const Sidebar = () => {
    const [extended, setExtented] = useState<boolean>(true);
    const { newChat, chatLog } = useContext(Context);

    console.log(chatLog)
  return (
    <div className='sidebar'>
        <div className="top">
            <Image onClick={() => setExtented(prev => !prev)} className='menu' src={assets.menu_icon} alt="" />
            <div onClick={() => newChat()} className="new-chat">
                <Image src={assets.plus_icon} alt="" />
                {extended ? <p>New Chat</p> : null}
            </div>
            {extended ? (
                <div className="recent">
                    <p className="recent-title">
                        Recent
                    </p>
                    {chatLog.map((item: any, index: number) => {
                        return (
                            <Link href={`/chat/${item?.id}`}>
                                <div key={index} className="recent-entry">
                                    <Image src={assets.message_icon} alt="" />
                                    <p>{item?.prompt.slice(0, 18)} ...</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                null
            )}
        </div>
        <div className="bottom">
            <div className="bottom-item recent-entry">
                <Image src={assets.question_icon} alt="" />
                {extended ? <p>Help</p> : null}
            </div>
            <div className="bottom-item recent-entry">
                <Image src={assets.history_icon} alt="" />
                {extended ? <p>Activity</p> : null}
            </div>
            <div className="bottom-item recent-entry">
                <Image src={assets.setting_icon} alt="" />
                {extended ? <p>Settings</p> : null}
            </div>
        </div>
    </div>
  )
}

export default Sidebar