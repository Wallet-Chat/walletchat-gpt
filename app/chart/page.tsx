"use client";
import homeStore from "@/lib/homeStore";
import Link from "next/link";
import React from "react";

// Initial placeholder array of coins
const initialCoins = [
  {
    name: "BTC",
    image: "image", // Placeholder, replace with actual image URL
    id: "1",
    price: "65,000",
  },
  {
    name: "ETH",
    image: "image", // Placeholder, replace with actual image URL
    id: "2",
    price: "4,000",
  },
  {
    name: "LTC",
    image: "image", // Placeholder, replace with actual image URL
    id: "3",
    price: "200",
  },
  {
    name: "XRP",
    image: "image", // Placeholder, replace with actual image URL
    id: "4",
    price: "1",
  },
];

// Type for coins array
type Coin = {
  name: string;
  image: string;
  id: string;
  price: string;
};

// Define the Chart component, receiving coins as a prop
function Chart({ coins }: { coins: Coin[] }) {
  const store: any = homeStore();

  const [fetchedCoins, setFetchedCoins] = React.useState<Coin[]>(initialCoins);

  //   React.useEffect(() => {
  //     const fetchCoins = async () => {
  //       try {
  //         const response = await store.fetchCoins();
  //         if (response?.data?.coins) {
  //           setFetchedCoins(response.data.coins);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching coins:", error);
  //       }
  //     };

  //     fetchCoins();
  //   }, [store]);

  return (
    <div>
      {fetchedCoins.map((coin) => (
        <div key={coin.id}>
          <Link href={`/chart/${coin.id}`}>{coin.name}</Link>
          <p>Price: {coin.price}</p>
          {/* Placeholder for the image, replace src with actual URL */}
          <img
            src={coin.image}
            alt={`${coin.name} logo`}
            width={50}
            height={50}
          />
        </div>
      ))}
    </div>
  );
}

export default Chart;
