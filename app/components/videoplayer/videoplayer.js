"use client";

import React from "react";
import { Card, CardBody, CardTitle, CarouselItem } from "react-bootstrap";
import CloudinaryWidgetButton from "./videoplayeruploadwidget";
import SampleVideo from "../sample_video/SampleVideo";
import { Carousel } from "react-bootstrap";
import { useState } from "react";

const sample_videos = [
  {"video_name":"Dance","public_id":"samples/dance-2","cloud_name":"demo"},
  {"video_name":"people","public_id":"yabsftz11bglblauxva0","cloud_name":"dmr4n68im"}
];

function VideoPlayerComponent() {
  const [video, setVideo] = useState({"cloud_name":"demo","public_id":"samples/dance-2"});
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
          className="col-3"
          style={{ backgroundColor: "white", borderRadius: "10px" }}
        >
          <div className="row p-3">
          <CloudinaryWidgetButton />
            <div className="p-1">
              <Carousel interval={null} className="w-100">
                {sample_videos.map((video) => (
                <CarouselItem><SampleVideo video={video} setVideo={setVideo}/></CarouselItem>
              ))}
              </Carousel>  
            </div>
          </div>
          <div className="row p-3">
            <button className="btn btn-warning">Detect Faces</button>
          </div>
        
        </div>
        <div className="col col-9">
          <div className="row w-100 p-2">
            <iframe
              src={
                "https://player.cloudinary.com/embed/?cloud_name="+video.cloud_name+"&public_id=" +
                video.public_id
              }
              width="700"
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
      </div>
    </div>
  );
}

export default VideoPlayerComponent;
