"use client";

import React from "react";

import { TypeAnimation } from "react-type-animation";
import Link from "next/link";

function SignIn() {
  return (
    <div className="m-0 p-5">
      <div
        style={{
          backgroundColor: "transparent",
          marginTop: "35%",
          marginLeft: "10.5%",
        }}
      >
        <TypeAnimation
          className="tomorrow-regular"
          cursor={true}
          sequence={["Welcome to Groovy!", 3000, ""]}
          style={{
            color: "#fff",
            fontSize: "5.5rem",
            width: "1000px",
            display: "block",
          }}
          repeat={Infinity}
        />
      </div>
      <button className="cyber_btn mt-5" style={{ marginLeft: "50%" }}>
        <span className="cyber_btn__content">
          <Link href="/dashboard">Press to get Started</Link>
        </span>
        <span className="cyber_btn__glitch"></span>
        <span className="cyber_btn__label">r25</span>
      </button>
    </div>
  );
}

export default SignIn;
