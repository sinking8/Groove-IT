"use client";

import React from "react";
import {
  Carousel,
  CarouselItem,
  Card,
  CardImg,
  CardBody,
} from "react-bootstrap";
import CloudinaryWidgetButton from "./videoplayeruploadwidget";
import SampleVideo from "../sample_video/SampleVideo";
import { useState } from "react";

import ReactLoading from "react-loading";
import Button from "./Button";
import { ButtonThemes, ButtonTypes, ButtonSizes } from "./buttonTypes";
import Toast from "react-bootstrap/Toast";
import axios from "axios";

import styles from "./videoplayer.module.css";
import Image from "next/image";

import window from "global";

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
  { name: "VIGNETTE", transformation_string: "e_vignette" },
  { name: "VIS NOISE", transformation_string: "e_noise:100" },
  { name: "BLUR EFF", transformation_string: "e_blur:800" },
];

const blind_options = [
  {
    name: "Deuteranopia",
    blind_code: "d",
    blind_img: "/color_blind_images/deut.png",
  },
  {
    name: "Protanopia",
    blind_code: "p",
    blind_img: "/color_blind_images/prot.png",
  },
  {
    name: "Tritanopia",
    blind_code: "t",
    blind_img: "/color_blind_images/tritan.png",
  },
];

flag = false;
let utterance;

if ("speechSynthesis" in window) {
  var synth = speechSynthesis;
  var flag = false;

  //stop when change page ???(not sure)
  if (synth.speaking) {
    /* stop narration */
    /* for safari */
    flag = false;
    synth.cancel();
  }
}

function onClickPlay(content) {
  if (!flag) {
    flag = true;
    utterance = new SpeechSynthesisUtterance(content);

    utterance.onend = function () {
      flag = false;
    };
    synth.speak(utterance);
    let r = setInterval(() => {
      console.log(speechSynthesis.speaking);
      if (!speechSynthesis.speaking) {
        clearInterval(r);
      } else {
        speechSynthesis.resume();
      }
    }, 14000);
  }
  if (synth.paused) {
    synth.resume();
  }
}

function onClickPause() {
  if (synth.speaking && !synth.paused) {
    synth.pause();
  }
}

function contruct_transformation_string(chosentransformations) {
  let transformation_string = "";
  if (chosentransformations == undefined || chosentransformations.length == 0) {
    return transformation_string;
  }
  for (let i = 0; i < chosentransformations.length; i++) {
    transformation_string += chosentransformations[i];
    if (i != transformations.length - 1) {
      transformation_string += "/";
    }
  }
  return transformation_string;
}

function generate_caption_url(public_id, cloud_name) {
  return (
    "https://player.cloudinary.com/embed/?public_id=" +
    public_id +
    "&cloud_name=" +
    cloud_name
  );
}

function construct_cloudinary_url(public_id, cloud_name, curr_transformations) {
  const transformation = contruct_transformation_string(curr_transformations);
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
  const [blindoption, setBlindOption] = useState(false);
  const [avl, setAVL] = useState(false);
  const [iscaptionvideo, setIsCaptionVideo] = useState(false);

  const [avldata, setAVLData] = useState({});
  const [chosenfaces, setChosenFaces] = useState([]);
  const [message, setMessage] = useState("");

  const [toastshow, settoastShow] = useState(true);
  const toggletoast = () => settoastShow(!toastshow);

  const [chosentransformations, setChosenTransformations] = useState([]);
  const [activeBlindOption, setActiveBlindOption] = useState("");

  const [currentoption, setCurrentOption] = useState("");

  const uwConfig = {
    cloudName: "dmr4n68im",
    uploadPreset: "ml_default",
  };

  let server_url = process.env.NEXT_SERVER_URL;

  const activate = async () => {
    setImages([]);
    setBlindOption(true);
  };
  const anonymize = async () => {
    setAVL(false);
    setBlindOption(false);
    setLoading(true);
    setActivated(false);
    setIsCaptionVideo(false);

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
    setAVL(false);
    setBlindOption(false);
    setIsCaptionVideo(false);
    axios
      .post(
        server_url + "/get_faces_cloudinary?cloudinary_url=" + cloudinary_url
      )
      .then((response) => {
        setImages(response.data.faces);
        setLoading(false);
        setActivated(true);
      });
  };

  const daltonize = async (blind_option) => {
    let cloudinary_url = construct_cloudinary_url(
      video.public_id,
      video.cloud_name
    );
    setLoading(true);
    setImages([]);
    setIsCaptionVideo(false);
    axios
      .post(
        server_url +
          "/daltonize_video_cloudinary?cloudinary_url=" +
          cloudinary_url +
          "&daltonize_type=" +
          blind_option
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

  const captionize = async () => {
    let cloudinary_url = construct_cloudinary_url(
      video.public_id,
      video.cloud_name
    );
    setLoading(true);
    setAVL(false);
    setBlindOption(false);
    setIsCaptionVideo(true);
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
    setAVL(false);
    setLoading(true);
    setIsCaptionVideo(false);
    setImages([]);
    axios
      .post(
        server_url + "/bg_music_cloudinary?cloudinary_url=" + cloudinary_url
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

  const avl_support = async () => {
    let cloudinary_url = construct_cloudinary_url(
      video.public_id,
      video.cloud_name
    );
    setLoading(true);
    setImages([]);
    setIsCaptionVideo(false);
    axios
      .post(
        server_url + "/avl_support_cloudinary?cloudinary_url=" + cloudinary_url
      )
      .then((response) => {
        console.log(response);
        setLoading(false);
        setAVL(true);
        setAVLData(response.data);
        setActivated(true);
      });
  };

  return (
    <>
      <div className="m-0 p-0 container container-fluid">
        <div
          className="row"
          style={{
            marginLeft: "2.5%",
            paddingTop: "1%",
            width: "213vh",
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
            <div className="row m-2 p-0">
              <CloudinaryWidgetButton uwConfig={uwConfig} setVideo={setVideo} />
              <Card
                className="mt-2 p-0 mb-2"
                style={{
                  borderColor: "#29b5a8",
                  borderWidth: "2.1px",
                  borderRadius: "10px",
                }}
              >
                <div
                  className="ml-2 mt-2"
                  style={{ textAlign: "center", fontSize: "28px" }}
                >
                  Gen AI Tools
                </div>
                <div className="card-body mt-1 p-0">
                  <div className="row  m-0 p-0 mt-2">
                    <Button
                      size={ButtonSizes.MEDIUM}
                      label="Anonymize"
                      onClickHandler={() => {
                        setActivated(false);
                        setCurrentOption("Anonymize");
                        detect_faces();
                      }}
                      type={
                        currentoption == "Anonymize"
                          ? ButtonTypes.PRIMARY
                          : ButtonTypes.SECONDARY
                      }
                      disabled={!activated}
                    />
                  </div>
                  <div className="row m-0 p-0">
                    <Button
                      size={ButtonSizes.MEDIUM}
                      label="Colorize"
                      onClickHandler={() => {
                        setActivated(false);
                        setCurrentOption("Colorize");
                        activate();
                      }}
                      disabled={!activated}
                      type={
                        currentoption == "Colorize"
                          ? ButtonTypes.PRIMARY
                          : ButtonTypes.SECONDARY
                      }
                    />
                  </div>
                  <div className="row m-0 p-0">
                    <Button
                      size={ButtonSizes.MEDIUM}
                      label="Captionize"
                      onClickHandler={() => {
                        setActivated(false);
                        setCurrentOption("Captionize");
                        captionize();
                      }}
                      disabled={!activated}
                      type={
                        currentoption == "Captionize"
                          ? ButtonTypes.PRIMARY
                          : ButtonTypes.SECONDARY
                      }
                    />
                  </div>
                  <div className="row p-0 m-0">
                    <Button
                      size={ButtonSizes.MEDIUM}
                      label="Tunify"
                      onClickHandler={() => {
                        setActivated(false);
                        setCurrentOption("Tunify");
                        tunify();
                      }}
                      disabled={!activated}
                      type={
                        currentoption == "Tunify"
                          ? ButtonTypes.PRIMARY
                          : ButtonTypes.SECONDARY
                      }
                    />
                  </div>

                  <div className="row m-0 p-0">
                    <Button
                      size={ButtonSizes.MEDIUM}
                      icon="save"
                      label="AVL Support"
                      onClickHandler={() => {
                        setActivated(false);
                        setCurrentOption("AVL Support");
                        avl_support();
                      }}
                      disabled={!activated}
                      type={
                        currentoption == "AVL Support"
                          ? ButtonTypes.PRIMARY
                          : ButtonTypes.SECONDARY
                      }
                    ></Button>
                  </div>
                </div>
              </Card>

              {transformations.map((transformation) => (
                <div
                  key={transformation.name}
                  className="flex container-fluid mt-2 ml-4 w-50 justify-end p-1 col"
                  style={{
                    borderRadius: "10px",
                    borderColor: "black",
                    borderWidth: "1.1px",
                    marginLeft: "1%",
                  }}
                >
                  <a style={{ fontSize: "16px" }}>{transformation.name}</a>
                  <button
                    key={transformation.name} // Ensure each button has a unique key
                    type="button"
                    className={
                      "p-0 " +
                      `${styles["btn-toggle"]} ${styles["btn"]} ${
                        styles["btn-sm"]
                      } ${
                        chosentransformations.includes(
                          transformation.transformation_string
                        )
                          ? styles["active"]
                          : ""
                      }`
                    }
                    onClick={() => {
                      if (
                        chosentransformations.includes(
                          transformation.transformation_string
                        )
                      ) {
                        setChosenTransformations(
                          chosentransformations.filter(
                            (transformation_string) =>
                              transformation_string !==
                              transformation.transformation_string
                          )
                        );
                      } else {
                        // Include the Transformation
                        setChosenTransformations([
                          ...chosentransformations,
                          transformation.transformation_string,
                        ]);
                      }
                    }} // Use the new click handler
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
                  src={
                    iscaptionvideo
                      ? generate_caption_url(video.public_id, video.cloud_name)
                      : construct_cloudinary_url(
                          video.public_id,
                          video.cloud_name,
                          chosentransformations
                        )
                  }
                  width="950"
                  height="580"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  className="ml-1"
                  allowfullscreen
                  frameborder="0"
                ></iframe>
              )}
            </div>
            <div
              className="row mt-1 m-1 container d-md-flex "
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                borderColor: "#29b5a8",
                borderWidth: "3.1px",
                height: "26%",
                width: "99%",
                overflow: "auto",
              }}
            >
              {images.length == 0 || loading ? (
                <></>
              ) : (
                <>
                  {images.map((image) => (
                    <Card
                      key={image["filename"]}
                      style={{
                        width: "6.8rem",
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
                  <btn
                    className="btn btn-success col m-3"
                    style={{ fontSize: "1.5rem" }}
                    onClick={() => {
                      anonymize();
                    }}
                  >
                    <b>ANONYMIZE</b>
                  </btn>
                </>
              )}
              {blindoption ? (
                <>
                  <Card className="m-3 col-4">
                    <Card.Title style={{ textAlign: "center" }}>
                      Actual Image
                    </Card.Title>
                    <div className="container d-md-flex p-1 m-0">
                      <img
                        src="/color_blind_images/actual.png"
                        className="col-6"
                        width={70}
                        style={{ borderRadius: "10px" }}
                      ></img>
                      <div
                        className="container col-10 m-1 p-0"
                        style={{
                          fontSize: "13px",
                          overflow: "auto",
                          textAlign: "left",
                        }}
                      >
                        <p>
                          <b>Choose an Option</b> <br></br>with an image similar
                          to <br></br>this one for optimal <br></br>colorblind
                          support toning.
                        </p>
                      </div>
                    </div>
                  </Card>
                  {blind_options.map((blind_option) => (
                    <Card
                      key={blind_option.blind_code}
                      style={{
                        backgroundColor:
                          activeBlindOption === blind_option.blind_code
                            ? "#00f2ea"
                            : "white",
                      }}
                      className="col-2 m-3"
                      onClick={(e) => {
                        setActiveBlindOption(blind_option.blind_code);
                        daltonize(blind_option.blind_code);
                      }}
                    >
                      <Card.Title style={{ textAlign: "center" }}>
                        {blind_option.name}
                      </Card.Title>
                      <Card.Img src={blind_option.blind_img} />
                    </Card>
                  ))}
                </>
              ) : (
                <></>
              )}
              {avl ? (
                <>
                  <div
                    className="col col-6 m-0 p-3"
                    style={{
                      color: "black",
                      borderRadius: "10px",
                      border: "1px solid black",
                    }}
                  >
                    <b>Translated Text</b>
                    <p>{avldata["translated_text"]}</p>
                  </div>
                  <div
                    className="col ml-1 p-2"
                    style={{
                      color: "black",
                      borderRadius: "10px",
                      border: "1px solid black",
                    }}
                  >
                    <b>Speech Synthesis</b>
                    <div
                      className="w-100 container d-md-flex"
                      style={{ alignContent: "left", justifyContent: "left" }}
                    >
                      <button
                        className="ml-2 w-50"
                        id={styles["speechplay"]}
                        onClick={() => {
                          onClickPlay(avldata["translated_text"]);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="ml-2 w-50"
                        id={styles["speechpause"]}
                        onClick={() => {
                          onClickPause();
                        }}
                      >
                        Pause
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <></>
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
