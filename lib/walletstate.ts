"use client"
import { useAccount } from 'wagmi';
const { address, isConnected } = useAccount();


export const getWalletAddress = () => {
    if(isConnected){
        const walletAddress = address;
        console.log('Getting wallet address', walletAddress);
        return walletAddress || null;
    }
    return null
};
