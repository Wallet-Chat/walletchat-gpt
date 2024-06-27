"use client";
import React, { useContext } from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import { Context } from "@/context/Context";
import Header from "../Common/Header";
import Form from "../Form/Form";
import { useRouter } from "next/navigation";
import { CoinChart } from "../Chart/CoinChart";

const Chat = ({ id }: { id: string }) => {
  const router = useRouter();
  const { chatLog } = useContext(Context);
  const result = chatLog?.find((item: any) => item.id === id);

  if (result === undefined) {
    router.replace("/");
  }

  return (
    <div className="main">
      <Header />
      <div className="main-container">
        <ChatMessage
          key={result.id}
          prompt={result?.prompt}
          loading={result?.loading}
          resultData={result?.resultData}
        />
        {/* <CoinChart /> */}
        <Form />
      </div>
    </div>
  );
};

export default Chat;
