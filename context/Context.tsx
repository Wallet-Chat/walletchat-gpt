"use client"
import { createContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const Context = createContext<any>({} as any);

const ContextProvider = (props: any) => {
    const { address, isConnected } = useAccount();
   
    const [wallet, setWallet] = useState<`0x${string}` | undefined>();

    useEffect(() => {
        setWallet(address);
    }, [isConnected])

    const contextValue = {
        wallet,
        setWallet
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider;