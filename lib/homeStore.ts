import { create } from "zustand";
import axios from "axios";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

const homeStore = create((set) => ({
  fetchCoins: async () => {
    try {
      const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`;
      // const params = { symbol }; // Correctly formatted object to pass as query params
      const headers = {
        "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY, // Ensure you have the API key set in your environment variables
      };
      const res = await axios.get(url, { headers });
      console.log(res.data);
    } catch (error) {
      console.error("Error fetching coins:", error);
    }
  },
}));

export default homeStore;
