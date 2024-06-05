"use client"
import Chat from '@/components/Chat/Chat'
import Sidebar from '@/components/Sidebar/Sidebar';

type Props = {
    params: { id: string }
}

const page = ({ params: { id } }: Props) => {

  return (
    <div className='home'>
      <Sidebar />
      <Chat id={id} />
    </div>
)}

export default page