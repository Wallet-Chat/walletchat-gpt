import Main from "@/components/Main/Main";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Chat } from "@/components/chat";
import { nanoid } from "nanoid";

export default function Home() {
  const id = nanoid()
  return (
    <div className="home">
      <Sidebar />
      <Main />
      {/* <Chat id={id} /> */}
    </div>
  );
}
