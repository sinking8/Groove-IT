//Background.js
"use client";
import { useState, useRef, useEffect } from "react";
import HALO from "vanta/dist/vanta.halo.min";
import * as THREE from "three";

export default function Background({ width, height, children }) {
  const [vantaEffect, setVantaEffect] = useState(0);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        HALO({
          THREE,
          el: vantaRef.current,
          minWidth: width,
          xOffset: 0.16,
          size: 1.4,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      className="m-0 p-0 w-100"
      ref={vantaRef}
      style={{ width: "100vh", height: "100vh", minWidth: "100vh" }}
    >
      {children}
    </div>
  );
}
