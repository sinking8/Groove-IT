"use client";

import React from "react";

import { TypeAnimation } from "react-type-animation";
import Link from "next/link";

import styles from "./signin.module.css";

function SignIn() {
  return (
    <div className="m-0 p-5">
      <div
        style={{
          backgroundColor: "transparent",
          marginTop: "15%",
          marginLeft: "2%",
        }}
      >
        <a
          className="tomorrow-regular"
          cursor={true}
          style={{
            color: "#fff",
            fontSize: "5.5rem",
            width: "1000px",
            display: "block",
            textDecoration: "none",
          }}
          repeat={Infinity}
        >
          Welcome to Groove-IT!
        </a>
      </div>
      <a id={styles.a} href="/dashboard">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        Press to get Started
      </a>
    </div>
  );
}

export default SignIn;
