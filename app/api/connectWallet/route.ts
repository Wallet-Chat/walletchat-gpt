// pages/api/connectWallet.ts

import { NextRequest, NextResponse } from 'next/server';
// import { getWalletAddress } from '../../../lib/walletstate'; // Correct the path as needed
import { createUser } from '@/app/actions';
import { getWalletAddress, setWalletAddress } from '@/lib/walletstate';
import { kv } from '@vercel/kv';
// import { useAccount } from 'wagmi';

interface SuccessResponse {
    success: boolean;
    message?: string;
    walletAddress?: string;
}

interface ErrorResponse {
    message: string;
}

// POST handler to set the wallet address
export async function POST(req: NextRequest) {
    if (req.method !== 'POST') {
        return new NextResponse(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: {'Content-Type': 'application/json'}
        });
    }

    try {
        const body = await req.json();
        const { walletAddress } = body;
        if (typeof walletAddress === 'string') {
            let res = new NextResponse(JSON.stringify({ success: true, message: 'Wallet address updated: ', walletAddress }), {
                status: 200,
                headers: {'Content-Type': 'application/json'}
            });

            await setWalletAddress(res, walletAddress);
            await createUser(walletAddress);

            return res;  // Return the response directly
        } else {
            return new NextResponse(JSON.stringify({ message: 'Invalid wallet address provided' }), {
                status: 400,
                headers: {'Content-Type': 'application/json'}
            });
        }
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: 'Server error processing your request' }), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
}


// GET handler to retrieve the wallet address
export async function GET(req: NextRequest) {
    if (req.method !== 'GET') {
        return new NextResponse(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: {'Content-Type': 'application/json'}
        });
    }

    try {
        const address = getWalletAddress(req);

        if (address) {
            console.log('Wallet address found', address)
            return new NextResponse(JSON.stringify({ success: true, walletAddress: address }), {
                status: 200,
                headers: {'Content-Type': 'application/json'}
            });
        } else {
            return new NextResponse(JSON.stringify({ message: 'ConnectWallet: No wallet connected' }), {
                status: 404,
                headers: {'Content-Type': 'application/json'}
            });
        }
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: 'Server error processing your request in get wallet address' }), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
}
