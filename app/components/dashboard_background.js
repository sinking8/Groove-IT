//Background.js
"use client";
import { useState, useRef, useEffect } from "react";
import TOPOLOGY from "vanta/dist/vanta.topology.min";
import * as THREE from "three";

export default function DashBoardBackground({ width, height, children }) {
  const [vantaEffect, setVantaEffect] = useState(0);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        TOPOLOGY({
          el: vantaRef.current,
          minHeight: 200.0,
          minWidth: 200.0,
          backgroundColor: "black",
          color: "#ff0050",
          THREE: THREE, //This is different
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      className="w-100"
      ref={vantaRef}
      style={{ height: "100vh", minWidth: "100vh" }}
    >
      {children}
    </div>
  );
}
