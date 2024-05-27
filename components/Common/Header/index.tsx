"use client"
import React, { useEffect, useState } from "react";
import Button from "../Button";
import TemporaryDrawer from "./drawer";
import "./styles.css";
import Switch from "@mui/material/Switch";
import { toast } from "react-toastify";
import axios from "axios"; // Ensure axios is installed and imported

function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const isDark = localStorage.getItem("theme") === "dark";
      setDarkMode(isDark);
      if (isDark) {
        setDark();
      } else {
        setLight();
      }
    }
  }, []);

  useEffect(() => {
      if (localStorage.getItem("theme") == "dark") {
        setDark();
      } else {
        setLight();
      }
  }, []);

  const changeMode = () => {
      if (localStorage.getItem("theme") != "dark") {
        setDark();
      } else {
        setLight();
      }
      setDarkMode(!darkMode);
      toast.success("Theme Changed!");
  };

  const setDark = () => {
      localStorage.setItem("theme", "dark");
      document.documentElement.setAttribute("data-theme", "dark");
  };

  const setLight = () => {
      localStorage.setItem("theme", "light");
      document.documentElement.setAttribute("data-theme", "light");
  };

  const connectWallet = async () => {
    const simulatedWalletAddress = `0x${Math.random().toString(16).slice(2, 10)}`;
    try {
      const response = await axios.post('/api/connectWallet', { walletAddress: simulatedWalletAddress });
      console.log(`Wallet connected: ${simulatedWalletAddress}`);
    } catch (error) {
      toast.error("Failed to connect wallet.");
      console.log("Error connecting wallet:", error);
    }
  };

  return (
    <div className="header">
      <a href="/">
        <h1 className="header-text">
          WalletChat AI<span style={{ color: "var(--blue)" }}>.</span>
        </h1>
      </a>
      <div className="links">
        <Switch checked={darkMode} onClick={() => changeMode()} />
        <a href="/">
          <p className="link">Home</p>
        </a>
        <a href="/dashboard">
          <p className="link">Coinlist</p>
        </a>
        <a href="#" onClick={connectWallet}>
        <Button text={"connect wallet"} onClick={connectWallet} />
      </a>
      </div>
      <div className="drawer-component">
        <TemporaryDrawer />
      </div>
    </div>
  );
}

export default Header;
