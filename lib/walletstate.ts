import { NextRequest, NextResponse } from 'next/server';
import cookie from 'cookie';

export const setWalletAddress = (res: NextResponse, address: string) => {
    return new Promise((resolve, reject) => {
        try {
            // Serialize the cookie with the wallet address
            const cookieHeader = cookie.serialize('walletAddress', address, {
                path: '/',
                httpOnly: false,  // If you want it to be accessible via JavaScript
                secure: false,  // Use HTTPS in production, but false for localhost
                sameSite: 'lax',  // Use 'lax' for better compatibility
                maxAge: 60 * 60 * 24 * 7 // 1 week in seconds
            });

            // Set the 'Set-Cookie' header on the response
            res.headers.append('Set-Cookie', cookieHeader);
            console.log("Setting Cookie: ", cookieHeader);

            resolve(res);
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
};

export const getWalletAddress = (req: NextRequest): string | null => {
    // Retrieve 'cookie' header using the .get() method
    const cookieHeader = req.headers.get('cookie');
    const cookies = cookie.parse(cookieHeader || '');
    const walletAddress = cookies.walletAddress;
    console.log('Getting wallet address', walletAddress);
    return walletAddress || null;
};
