"use client";

import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import FadeInWhenVisible from "../components/animations/fadeinwhenvisible";

import styles from "./Dashboard.module.css";

function Dashboard() {
  const [done, setDone] = useState(undefined);

  useEffect(() => {
    setTimeout(() => {
      setDone(true);
    }, 2000);
  }, []);

  return (
    <div className={styles.main_container}>
      {!done ? (
        <div className={styles.loaderContainer}>
          <ReactLoading
            type={"bars"}
            color={"#00f2ea"}
            height={100}
            width={100}
          />
          <h3 className={styles.loadingText}>Loading the Workspace</h3>
        </div>
      ) : (
        <FadeInWhenVisible>
          <ul>
            <h3 style={{ color: "white" }}>Hello</h3>
          </ul>
        </FadeInWhenVisible>
      )}
    </div>
  );
}

export default Dashboard;
