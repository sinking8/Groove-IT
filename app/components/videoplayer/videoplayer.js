"use client";

import React from "react";
import { Carousel, CarouselItem, Card, CardHeader } from "react-bootstrap";
import CloudinaryWidgetButton from "./videoplayeruploadwidget";
import SampleVideo from "../sample_video/SampleVideo";
import { useState } from "react";
import ReactLoading from "react-loading";
import { Button } from "react-bootstrap";

import Toast from "react-bootstrap/Toast";
import axios from "axios";

import styles from "./videoplayer.module.css";

const sample_videos = [
  { video_name: "Dance", public_id: "samples/dance-2", cloud_name: "demo" },
  {
    video_name: "people",
    public_id: "qtvex5rlnyf8dldcyshz",
    cloud_name: "dmr4n68im",
  },
];

const transformations = [
  { name: "REVERSE", transformation_string: "e_reverse" },
  {
    name: "FADE IN & OUT",
    transformation_string: "e_fade:2000/e_fade:-2000",
  },
  { name: "VIGNETTE", transformation_string: "e_vignette" },
  { name: "VISUAL NOISE", transformation_string: "e_noise:100" },
];

function construct_cloudinary_url(public_id, cloud_name, transformation = "") {
  if (transformation == "") {
    return (
      "https://res.cloudinary.com/" +
      cloud_name +
      "/video/upload/" +
      public_id +
      ".mp4"
    );
  }
  return (
    "https://res.cloudinary.com/" +
    cloud_name +
    "/video/upload/" +
    transformation +
    "/" +
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

  const [chosenfaces, setChosenFaces] = useState([]);
  const [message, setMessage] = useState("");

  const [toastshow, settoastShow] = useState(true);
  const toggletoast = () => settoastShow(!toastshow);

  const [currentTransformation, setCurrentTransformation] = useState("");
  const [activeTransformation, setActiveTransformation] = useState("");

  const handleToggle = (transformation) => {
    // Toggle the transformation: if it's already active, deactivate it, otherwise activate it
    const newTransformation =
      activeTransformation === transformation ? "" : transformation;
    setActiveTransformation(newTransformation);
    // Optionally, apply the transformation immediately or update the video URL
    setCurrentTransformation(newTransformation);
  };

  const uwConfig = {
    cloudName: "dmr4n68im",
    uploadPreset: "ml_default",
  };

  let server_url = process.env.NEXT_SERVER_URL;

  const anonymize = async () => {
    setLoading(true);
    let faces = "";
    if (chosenfaces.length == images.length) {
      faces = "all";
    } else {
      faces = chosenfaces.join(",");
    }
    let cloudinary_url = construct_cloudinary_url(
      video.public_id,
      video.cloud_name
    );

    axios
      .post(
        server_url +
          "/blur_faces_cloudinary?cloudinary_url=" +
          cloudinary_url +
          "&faces=" +
          faces
      )
      .then((response) => {
        setVideo({
          cloud_name: response.data.response_dict["cloud_name"],
          public_id: response.data.response_dict["public_id"],
        });
        setLoading(false);
        setActivated(true);
      });
  };
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

  const daltonize = async () => {
    let cloudinary_url = construct_cloudinary_url(
      video.public_id,
      video.cloud_name
    );
    setLoading(true);
    setImages([]);
    axios
      .post(
        server_url +
          "/daltonize_video_cloudinary?cloudinary_url=" +
          cloudinary_url
      )
      .then((response) => {
        console.log(response);
        setVideo({
          cloud_name: response.data.response_dict["cloud_name"],
          public_id: response.data.response_dict["public_id"],
        });
        setLoading(false);
        setActivated(true);
      });
  };

  const captionize = async () => {
    let cloudinary_url = construct_cloudinary_url(
      video.public_id,
      video.cloud_name
    );
    setLoading(true);
    setImages([]);
    axios
      .post(
        server_url +
          "/generate_caption_cloudinary?cloudinary_url=" +
          cloudinary_url
      )
      .then((response) => {
        console.log(response);
        setVideo({
          cloud_name: response.data.response_dict["cloud_name"],
          public_id: response.data.response_dict["public_id"],
        });
        setLoading(false);
        setActivated(true);
      });
  };

  const tunify = async () => {
    let cloudinary_url = construct_cloudinary_url(
      video.public_id,
      video.cloud_name
    );
    setLoading(true);
    setImages([]);
    axios
      .post(
        server_url + "/bg_music_cloudinary?cloudinary_url=" + cloudinary_url
      )
      .then((response) => {
        console.log(response);
        setVideo({
          cloud_name: response.data.response_dict["cloud_name"],
          public_id: response.data.response_dict["public_id"],
        });
        setLoading(false);
        setActivated(true);
      });
  };

  return (
    <>
      <div className="m-0 p-0 container w-100 container-fluid">
        <div
          className="row"
          style={{
            marginLeft: "5%",
            paddingTop: "1%",
            width: "208vh",
          }}
        >
          <div
            className="col col-3"
            style={{ backgroundColor: "white", borderRadius: "10px" }}
          >
            <div className="row p-3">
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
            <div className="row m-2">
              <CloudinaryWidgetButton uwConfig={uwConfig} setVideo={setVideo} />
              <Card className="mt-2 mb-2 p-2">
                <CardHeader style={{ textAlign: "center", fontSize: "20px" }}>
                  <b>Gen AI Tools</b>
                </CardHeader>
                <div className="card-body mt-1 p-0">
                  <div className="container-fluid d-md-flex">
                    <button
                      className="btn"
                      onClick={() => {
                        setActivated(false);
                        detect_faces();
                      }}
                      disabled={!activated}
                      style={{
                        width: "50%",
                        backgroundColor: "#29b5a8",
                        color: "white",
                      }}
                    >
                      Anonymize
                    </button>
                    <button
                      className="btn ml-2"
                      onClick={() => {
                        setActivated(false);
                        daltonize();
                      }}
                      disabled={!activated}
                      style={{
                        width: "50%",
                        backgroundColor: "#29b5a8",
                        color: "white",
                      }}
                    >
                      Colorize
                    </button>
                  </div>
                  <div className="mt-2 container-fluid d-md-flex mt-2">
                    <button
                      className="btn"
                      onClick={() => {
                        setActivated(false);
                        captionize();
                      }}
                      disabled={!activated}
                      style={{
                        width: "50%",
                        backgroundColor: "#29b5a8",
                        color: "white",
                      }}
                    >
                      Captionize
                    </button>
                    <button
                      className="btn ml-2"
                      onClick={() => {
                        setActivated(false);
                        tunify();
                      }}
                      disabled={!activated}
                      style={{
                        width: "50%",
                        backgroundColor: "#29b5a8",
                        color: "white",
                      }}
                    >
                      Tunify
                    </button>
                  </div>
                </div>
              </Card>

              {transformations.map((transformation) => (
                <div
                  className="flex container-fluid mt-1 justify-between p-2"
                  style={{
                    borderRadius: "10px",
                    borderColor: "black",
                    borderWidth: "1.8px",
                  }}
                >
                  <a style={{ fontSize: "16px" }}>
                    <b>{transformation.name}</b>
                  </a>
                  <button
                    key={transformation.name} // Ensure each button has a unique key
                    type="button"
                    className={
                      "p-0 " +
                      `${styles["btn-toggle"]} ${styles["btn"]} ${
                        styles["btn-sm"]
                      } ${
                        activeTransformation ===
                        transformation.transformation_string
                          ? styles["active"]
                          : ""
                      }`
                    }
                    onClick={() =>
                      handleToggle(transformation.transformation_string)
                    } // Use the new click handler
                  >
                    <div className={styles["handle"]}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="col container-fluid">
            <div className="row m-0 p-0">
              {loading ? (
                <div
                  style={{ paddingTop: "15%", paddingLeft: "43%" }}
                  className="w-100 m-4"
                >
                  <ReactLoading
                    type={"spinningBubbles"}
                    color={"black"}
                    height={110}
                    width={110}
                  />
                  <h4
                    style={{
                      color: "black",
                      marginTop: "10%",
                      marginLeft: "-2%",
                    }}
                  >
                    Processing....
                  </h4>
                </div>
              ) : (
                <iframe
                  src={construct_cloudinary_url(
                    video.public_id,
                    video.cloud_name,
                    currentTransformation
                  )}
                  width="1000"
                  height="570"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  className="ml-5"
                  allowfullscreen
                  frameborder="0"
                  style={{ width: "100%" }}
                ></iframe>
              )}
            </div>
            <div
              className="row mt-2 container d-md-flex m-2 "
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                height: "14vh",
              }}
            >
              {images.length == 0 || loading ? (
                <div></div>
              ) : (
                <>
                  {images.map((image) => (
                    <Card
                      style={{
                        width: "7rem",
                        backgroundColor: chosenfaces.includes(image["filename"])
                          ? "#00f2ea"
                          : "white",
                      }}
                      className="m-1"
                      onClick={(e) => {
                        let updatedChosenFaces;
                        if (chosenfaces.includes(image["filename"])) {
                          updatedChosenFaces = chosenfaces.filter(
                            (filename) => filename !== image["filename"]
                          );
                          setMessage("Face removed from anonymize list");
                        } else {
                          updatedChosenFaces = [
                            ...chosenfaces,
                            image["filename"],
                          ];
                          setMessage("Face added to anonymize list");
                        }
                        setChosenFaces(updatedChosenFaces);
                        toggletoast();
                      }}
                    >
                      <Card.Img
                        src={server_url + "/download_face/" + image["filename"]}
                        style={{ borderRadius: "10px" }}
                      ></Card.Img>
                    </Card>
                  ))}
                  <Button
                    className="btn btn-warning col m-3"
                    style={{ fontSize: "1.5rem" }}
                    onClick={() => {
                      anonymize();
                    }}
                  >
                    <b>ANONYMIZE</b>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {message != "" ? (
        <Toast
          className="p-0"
          show={toastshow}
          onClose={toggletoast}
          style={{ marginLeft: "75%", marginBottom: "4%" }}
          delay={3000}
          autohide
        >
          <Toast.Body style={{ textAlign: "center" }}>
            <b>{message}</b>
          </Toast.Body>
        </Toast>
      ) : (
        <> </>
      )}
    </>
  );
}

export default VideoPlayerComponent;
