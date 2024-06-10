import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { IconButton } from "@mui/material";
import Switch from "@mui/material/Switch";
import { toast } from "react-toastify";

export default function TemporaryDrawer() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // useEffect(() => {
  //   if (typeof localStorage !== 'undefined') {
  //     const isDark = localStorage.getItem("theme") === "dark";
  //     setDarkMode(isDark);
  //     if (isDark) {
  //       setDark();
  //     } else {
  //       setLight();
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   if (localStorage.getItem("theme") == "dark") {
  //     setDark();
  //   } else {
  //     setLight();
  //   }
  // }, []);

  // const changeMode = () => {
  //   if (localStorage.getItem("theme") != "dark") {
  //     setDark();
  //   } else {
  //     setLight();
  //   }
  //   setDarkMode(!darkMode);
  //   toast.success("Theme Changed!");
  // };

  // const setDark = () => {
  //   localStorage.setItem("theme", "dark");
  //   document.documentElement.setAttribute("data-theme", "dark");
  // };

  // const setLight = () => {
  //   localStorage.setItem("theme", "light");
  //   document.documentElement.setAttribute("data-theme", "light");
  // };
  return (
    <div>
      <IconButton onClick={() => setOpen(true)}>
        <MenuRoundedIcon className="link" />
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <div className="drawer-div">
        <a href="/">
          <p className="link">Home</p>
        </a>
        <a href="/dashboard">
          <p className="link">Coinlist</p>
        </a>
          {/* <Switch checked={darkMode} onClick={() => changeMode()} /> */}
        </div>
      </Drawer>
    </div>
  );
}