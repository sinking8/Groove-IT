"use client";

import React from "react";
import CloudinaryWidgetButton from "./videoplayeruploadwidget";
import { useState } from "react";

const sample_videos = [
  ["Sea Turtle", "samples/sea-turtle"],
  ["dance", "samples/dance-2"],
  ["elephants", "samples/elephants"],
];

function VideoPlayerComponent() {
  const [video, setVideo] = useState("samples/elephants");
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  return (
    <div className="m-0 p-0 container">
      <div
        className="row"
        style={{
          marginLeft: "6.5%",
          height: "10vh",
          paddingTop: "7%",
        }}
      >
        <div
          className="col-2"
          style={{ backgroundColor: "white", borderRadius: "10px" }}
        >
          <CloudinaryWidgetButton />
          {sample_videos.map((video) => (
            <button
              onClick={() => {
                alert(video[1]);
                setVideo(video[1]);
                forceUpdate();
              }}
              className="btn btn-primary m-2"
              key={video[0]}
            >
              {video[0]}
            </button>
          ))}
        </div>
        <div className="col col-8">
          <div className="row w-100 p-2">
            <iframe
              src={
                "https://player.cloudinary.com/embed/?cloud_name=demo&public_id=" +
                video
              }
              width="0"
              height="360"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowfullscreen
              frameborder="0"
            ></iframe>
          </div>
          <div
            className="row mt-1 m-2"
            style={{
              backgroundColor: "white",
              width: "100%",
              borderRadius: "10px",
              height: "50px",
            }}
          ></div>
        </div>
        <div
          className="col-2"
          style={{ backgroundColor: "white", borderRadius: "10px" }}
        >
          <h1>Hello</h1>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerComponent;
