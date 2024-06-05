import React, { useContext } from 'react'
import ChatMessage from '../ChatMessage/ChatMessage'
import { Context } from '@/context/Context';
import Header from '../Common/Header';
import Form from '../Form/Form';

const Chat = ({ id } : { id: string }) => {
    const { chatLog } = useContext(Context);
    const result = chatLog.find((item: any) => item.id === id);

  return (
    <div className="main">
      <Header />
      <div className='main-container'>
        <ChatMessage key={result.id} prompt={result?.prompt} loading={result?.loading} resultData={result?.resultData} />
        <Form />
      </div>
    </div>
  )
}

export default Chat