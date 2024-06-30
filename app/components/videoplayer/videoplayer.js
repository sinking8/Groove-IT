"use client";

import React from "react";
import { Carousel, CarouselItem, Card, CardBody, Image } from "react-bootstrap";
import CloudinaryWidgetButton from "./videoplayeruploadwidget";
import SampleVideo from "../sample_video/SampleVideo";
import { useState } from "react";
import ReactLoading from "react-loading";

import axios from "axios";

const sample_videos = [
  { video_name: "Dance", public_id: "samples/dance-2", cloud_name: "demo" },
  {
    video_name: "people",
    public_id: "yabsftz11bglblauxva0",
    cloud_name: "dmr4n68im",
  },
];

function construct_cloudinary_url(public_id, cloud_name) {
  return (
    "https://res.cloudinary.com/" +
    cloud_name +
    "/video/upload/" +
    public_id +
    ".mp4"
  );
}

function VideoPlayerComponent() {
  const [video, setVideo] = useState({
    cloud_name: "demo",
    public_id: "samples/dance-2",
  });
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(true);
  const [images, setImages] = useState([]);

  let server_url = process.env.NEXT_SERVER_URL;

  const detect_faces = async () => {
    let cloudinary_url = construct_cloudinary_url(
      video.public_id,
      video.cloud_name
    );
    setLoading(true);
    setImages([]);
    axios
      .post(
        server_url + "/get_faces_cloudinary?cloudinary_url=" + cloudinary_url
      )
      .then((response) => {
        console.log(response);
        setImages(response.data.faces);
        setLoading(false);
        setActivated(true);
      });
  };
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
                  <CarouselItem key={video.public_id}>
                    <SampleVideo video={video} setVideo={setVideo} />
                  </CarouselItem>
                ))}
              </Carousel>
            </div>
          </div>
          <div className="row p-3">
            <button
              className="btn btn-warning"
              onClick={() => {
                setActivated(false);
                detect_faces();
              }}
              disabled={!activated}
            >
              Detect Faces
            </button>
          </div>
        </div>
        <div className="col col-9">
          <div className="row w-100 p-2">
            {loading ? (
              <ReactLoading
                type={"bubbles"}
                color={"#00f2ea"}
                height={100}
                width={100}
              />
            ) : (
              <iframe
                src={
                  "https://player.cloudinary.com/embed/?cloud_name=" +
                  video.cloud_name +
                  "&public_id=" +
                  video.public_id
                }
                width="1000"
                height="360"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowfullscreen
                frameborder="0"
              ></iframe>
            )}
          </div>
          <div
            className="row mt-1 m-2 container d-md-flex"
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
            }}
          >
            {images.map((image) => (
              <Card style={{ width: "7rem" }} className="m-2">
                <Card.Img
                  src={server_url + "/download_face/" + image["filename"]}
                  style={{ borderRadius: "10px" }}
                ></Card.Img>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerComponent;
