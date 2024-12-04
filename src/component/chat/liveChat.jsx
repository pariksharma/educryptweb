import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, push } from "firebase/database";
import { format } from "date-fns";
import { ImAttachment } from "react-icons/im";
import AWS from "aws-sdk";
import { FaFilePdf, FaRegFilePdf, FaTimesCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import { getContentMeta } from "@/services";
import AudioPlayer from "./AudioPlayer";
// import EmojiPicker from "emoji-picker-react";
import { MdAudioFile } from "react-icons/md";
import { MdOutlinePictureAsPdf } from "react-icons/md";
import * as pdfjs from "pdfjs-dist";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8ISZRq949XJrbNeZm0gK54d9Q3zAzBtI",
  authDomain: "lab-elsaq-education.firebaseapp.com",
  databaseURL: "https://lab-elsaq-education-default-rtdb.firebaseio.com",
  projectId: "lab-elsaq-education",
  storageBucket: "lab-elsaq-education.appspot.com",
  messagingSenderId: "413835077933",
  appId: "1:413835077933:web:e9ad389b4f0e203dfa0ba4",
  measurementId: "G-1527TMN738",
};

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Initialize Firebase

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const REGION = process.env.NEXT_PUBLIC_S3_REGION;

const LiveChat = ({ chat_node, course_id, isPublic }) => {
  const [chatData, setChatData] = useState([]);
  const [input, setInput] = useState("");
//   const [uniqueId, setUniqueId] = useState(chat_node); // Example unique ID
  const [userId, setUserId] = useState("");
  const chatContainerRef = useRef(null);
  const [file, setFile] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [progress, setProgress] = useState("");
  const [type, setType] = useState("text");
  const [isLocked, setIsLocked] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [user_name, setUser_name] = useState('')
  const fileInputRef = useRef(null);

  // console.log('isPublic', isPublic)

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app); // Get Firebase Realtime Database instance

  AWS.config.update({
    region: REGION,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "ap-south-1:52721cc8-3b0f-47d4-a23a-50c387baee06", // Replace with your Cognito Identity Pool ID
    }),
  });

  const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
  });

  useEffect(() => {
    getChatData()
    getUserData()
    handleUserStatus()
  }, [isPublic]);

  useEffect(() => {
    // Function to apply overflow style based on viewport size
    const updateOverflowStyle = () => {
      const currentPath = window.location.pathname; // Get only the pathname, no query strings
      const viewportWidth = window.innerWidth;

      // Check if the URL matches the desired page
      if (currentPath.includes("/private/myProfile/play/")) {
        // Apply overflow: hidden for smaller devices (<= 1024px)
        if (viewportWidth >= 1024) {
          document.documentElement.style.overflow = "hidden";
        } else {
          document.documentElement.style.overflow = "auto"; // Remove overflow: hidden for larger devices
        }
      } else {
        document.documentElement.style.overflow = "auto"; // Reset for other pages
      }
    };

    // Apply the overflow style on mount
    updateOverflowStyle();

    // Listen for window resize events to update the overflow style dynamically
    window.addEventListener("resize", updateOverflowStyle);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", updateOverflowStyle);
    };
  }, []);

  const renderPdfFirstPage = async (pdfUrl) => {
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;

    // Get the first page
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale as needed

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Convert the canvas to a data URL and set it as an image URL
    return canvas.toDataURL("image/png");
  };



  const handleUserStatus = () => {
    try {

      const app_id = localStorage.getItem("appId");
      const userName = localStorage.getItem("userName");
      const user_id = localStorage.getItem("user_id");
      const user_mobile = localStorage.getItem('userMobile')
      setUser_name(userName)
      const curr_date = new Date();
     
        const userStatusRef = ref(
          database,
          `${app_id}/chat_master/${chat_node}/User/${user_id}`
        );
        update(userStatusRef, {
          id : user_id,
          interact : '1',
          joined_at : convertToTimestamp(curr_date),
          mobile : user_mobile,
          name : userName,
          online : "true",
          profile_picture : "",
          type : '1',
        })
          .then(() => {
            console.log("Status User successfully");
            // getChatData()
          })
          .catch((error) => {
            console.error("Error updating status:", error);
          });
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }



  const getChatData = () => {
    console.log("isPublic",isPublic)
    const app_id = localStorage.getItem("appId");
    const user_id = localStorage.getItem("user_id")
    setUserId(localStorage.getItem("user_id"));

    const chatRef = ref(
      database,
      `${app_id}/chat_master/${chat_node}/${isPublic != "0" ? "1TOM" : `1TO1/${user_id}`}`
    );
    
    // console.log(chatRef)
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const value = snapshot.val();
      console.log('value', value)
      if (value) {
        const messagesArray = value ? Object.values(value) : [];
        setInput("")
        if(isPublic != '0') {
          setChatData(messagesArray);
        }
        else {
          setChatData(messagesArray.filter((chat) => (chat?.platform == 0 || chat?.id == user_id) ))
        }
        // console.log('messagesArray', messagesArray)
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }

  const getUserData = () => {
    // console.log("isPublic",isPublic)
    const app_id = localStorage.getItem("appId");
    const user_id = localStorage.getItem("user_id")
    setUserId(localStorage.getItem("user_id"));
    const userRef = ref(
      database,
      `${app_id}/chat_master/${chat_node}/User/${user_id}`
    );
    
    // console.log('userRef', userRef)
    const unsubscribe = onValue(userRef, (snapshot) => {
      const value2 = snapshot.val();
      // console.log('value2', value2)
      if (value2) {
        setIsLocked(value2.is_chat_locked)
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }

  useEffect(() => {
    // Scroll to the bottom when chatData changes
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
        getUserData()
    }
  }, [chatData]);
  

  // const handleUserOffline = () => {
  //   try {
  //     const app_id = localStorage.getItem("appId");
  //     const user_id = localStorage.getItem("user_id");
  
  //     const userStatusRef = ref(
  //       database,
  //       `${app_id}/chat_master/${chat_node}/User/${user_id}`
  //     );
  
  //     // Update only the 'online' field
  //     update(userStatusRef, {
  //       online: "", // Set to an empty string to indicate offline
  //     })
  //       .then(() => {
  //         console.log("User 'online' status updated to offline.");
  //       })
  //       .catch((error) => {
  //         console.error("Error updating 'online' status:", error);
  //       });
  //   } catch (error) {
  //     console.error("Error updating user offline status:", error);
  //   }
  // };

  // const handleUpdateStatus = async (e) => {
  //   e.preventDefault();
  //   setShowPicker(false)
  //   // console.log("file978798", file);

  //   try {
  //     const uploadedUrl = type != "text" ? await uploadFile(input) : input; // Wait for uploadFile to complete

  //     const app_id = localStorage.getItem("appId");
  //     const userName = localStorage.getItem("userName");
  //     const user_id = localStorage.getItem("user_id")
  //     const curr_date = new Date();
  //     // console.log(convertToTimestamp(curr_date));

  //     if (uploadedUrl) {
  //       // console.log("Uploaded URL:", uploadedUrl, type);
  //       const statusRef = ref(
  //         database,
  //         `${app_id}/chat_master/${chat_node}/${isPublic != "0" ? "1TOM" : `1TO1`}`
  //       );
  //       push(statusRef, {
  //         date: convertToTimestamp(curr_date),
  //         id: user_id,
  //         is_active: "1",
  //         message: uploadedUrl,
  //         name: userName,
  //         platform: "4",
  //         profile_picture: "",
  //         type: type,
  //         course_id: course_id,
  //         mobile: "",
  //       })
  //         .then(() => {
  //           console.log("Status updated successfully");
  //           getChatData()
  //           setInput("");
  //           setImagePreviews([]);
  //           setFile(null);
  //           setProgress("");
  //           setType("text");
  //           if (fileInputRef.current) {
  //             fileInputRef.current.value = "";
  //           }
  //         })
  //         .catch((error) => {
  //           console.error("Error updating status:", error);
  //         });
  //     }
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //   }
  // };


  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setShowPicker(false);
    
    try {
      const uploadedUrl = type !== "text" ? await uploadFile(input) : input; // Wait for file upload if not text
      const app_id = localStorage.getItem("appId");
      const userName = localStorage.getItem("userName");
      const user_id = localStorage.getItem("user_id");
      const userMobile = localStorage.getItem("userMobile")
      const curr_date = new Date();
  
      if (uploadedUrl) {
        const messageNode = {
          course_id: course_id,
          date: convertToTimestamp(curr_date),
          id: user_id,
          is_active: "1",
          message: uploadedUrl,
          mobile: userMobile,
          name: userName,
          platform: "4",
          profile_picture: "",
          type: type,

        };
  
        const statusRef = ref(
          database,
          `${app_id}/chat_master/${chat_node}/1TOM`
        );
  
        // Push message node and handle Firebase ID

        push(statusRef, messageNode)
          .then((snapshot) => {
            // Attach the Firebase ID
            const firebase_id = snapshot.key;
            console.log('firebase_id', firebase_id)
            const updatedNode = { ...messageNode, firebase_id };
            // delete updatedNode.original;
  
            // Push the updated node to another reference
            const oneToOneRef = ref(
              database,
              `${app_id}/chat_master/${chat_node}/1TOM`
            );
            return update(oneToOneRef, updatedNode);
          })
          .then(() => {
            console.log("Status and node updated successfully");
            getChatData();
            // Reset inputs and states
            setInput("");
            setImagePreviews([]);
            setFile(null);
            setProgress("");
            setType("text");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          })
          .catch((error) => {
            console.error("Error updating status or pushing node:", error);
          });

          if(isPublic != "on") {
            const statusRef = ref(
              database,
              `${app_id}/chat_master/${chat_node}/1TO1/${user_id}`
            );
      
            // Push message node and handle Firebase ID
    
            push(statusRef, messageNode)
              .then((snapshot) => {
                // Attach the Firebase ID
                const firebase_id = snapshot.key;
                console.log('firebase_id', firebase_id)
                const updatedNode = { ...messageNode, firebase_id };
                // delete updatedNode.original;
      
                // Push the updated node to another reference
                const oneToOneRef = ref(
                  database,
                  `${app_id}/chat_master/${chat_node}/1TO1/${user_id}/${firebase_id}`
                );
                return update(oneToOneRef, updatedNode);
              })
              .then(() => {
                console.log("Status and node updated successfully");
                getChatData();
                // Reset inputs and states
                setInput("");
                setImagePreviews([]);
                setFile(null);
                setProgress("");
                setType("text");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              })
              .catch((error) => {
                console.error("Error updating status or pushing node:", error);
              });
          }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  
  const convertToTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.getTime(); // Convert milliseconds to seconds
  };

  const formatTime = (date) => {
    const cr_date = new Date(date);
    if (cr_date) {
      return format(cr_date, "h:mm a");
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    console.log("myfile", e.target.value);
    const SelectFile = e.target.files;
    console.log("SelectFile", SelectFile[0]);
    if (SelectFile.length) {
      setInput(SelectFile[0]);
      setFile(SelectFile[0]);
      const imageUrls = Array.from(SelectFile).map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviews(imageUrls);
      if (SelectFile[0]?.type.includes("image")) {
        setType("image");
      } else if (SelectFile[0]?.type.includes("pdf")) {
        setType("pdf");
      }
      else if (SelectFile[0]?.type.includes("audio")) {
        setType("audio");
      }
    }
    console.log(SelectFile);
  };

  

  const uploadFile = (file) => {
    console.log('file', file)
    return new Promise((resolve, reject) => {
      const params = {
        ACL: "public-read",
        Body: file,
        Bucket: S3_BUCKET,
        Key: file.name,
      };

      myBucket
        .putObject(params)
        .on("httpUploadProgress", (evt) => {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        })
        .send((err) => {
          if (err) {
            console.log(err);
            reject(err); // Reject the promise if there is an error
          } else {
            const uploadedImageUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${file.name}`;
            console.log("File uploaded successfully. URL:", uploadedImageUrl);
            resolve(uploadedImageUrl); // Resolve the promise with the URL
          }
        });
    });
  };

  const handleDeleteImage = () => {
    setInput("");
    setImagePreviews([]);
    setFile(null);
    setProgress("");
    setType("text");
    // Clear the file input value to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePdf = (value) => {
    if (typeof window !== "undefined") {
      window.open(value, "_blank");
    }
  };

  // Toggle the dropdown visibility

  // const onEmojiClick = (emojiObject) => {
  //   console.log('Selected Emoji:', emojiObject.emoji); // Logs the emoji character
  //   setInput((prevInput) => prevInput + emojiObject.emoji);
  // };

  return (
    <>
      <div className="chat-conversation">
        {/* {console.log('caht', chatData)} */}
        <div className="simplebar-content-wrapper">
          <div
            className="simplebar-content live-content"
            style={{ overflowY: "hidden" }}
            ref={chatContainerRef}
          >
            <ul
              className="list-unstyled chat-conversation-list"
              //   ref={chatContainerRef}
              id="chat-conversation-list"
            >
              {chatData?.length > 0 &&
                chatData.map(
                  (chat, index) =>
                    chat.type != "is_chat_locked" &&
                    chat.type != "poll" &&
                    chat?.id && (
                      <div
                        key={index}
                        className={`chat-list ${
                          userId === chat.id ? "right" : "left"
                        }`}
                      >
                        <div className="conversation-list">
                          <div className="user-chat-content">
                            <div className="ctext-wrap">
                              <div
                                className={`ctext-wrap-content ${
                                  userId === chat.id ? "" : "left-in"
                                }`}
                              >
                                <p className="mb-0 ctext-content-live">
                                  <h5 className="conversation-name mb-2">
                                    {chat.name}
                                  </h5>
                                  {/* {console.log('chat', chat?.message)} */}
                                  {chat?.type == "text" && chat?.message}
                                  {chat?.type == "image" && (
                                  <img
                                  src={chat?.message}
                                  className="chat-image"
                                  alt="Uploaded"
                                />
                                  )}
                                  {chat?.type == "pdf" && (
                                    <div
                                      className="pdf_file"
                                      onClick={() => handlePdf(chat?.message)}
                                    >
                                      {/* <FaRegFilePdf size={24} color="red" />{" "} */}
                                      {/* <img src={renderPdfFirstPage(chat?.message)} alt="" /> */}
                                      <img
                                        src="/assets/images/Pdf_imgChat.svg"
                                        alt=""
                                        srcset=""
                                      />
                                      
                                      <span className="pdf_title">
                                        {chat?.message.substring(
                                          chat?.message.lastIndexOf("/") + 1
                                        ) || "No PDF selected"}
                                      </span>
                                    </div>
                                  )}
                                  {chat?.type == "audio" && (
                                    <AudioPlayer
                                      audioUrl={chat?.message}
                                      userName={user_name}
                                      duration={
                                        chat?.date && formatTime(chat?.date)
                                      }
                                    />
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="left-time">
                              <small
                                className="dropdown-btn text-muted mb-0 ms-2"
                                tabIndex="0"
                              >
                                {chat?.date && formatTime(chat?.date)}
                                {/* {" "}|{" "} */}
                                {/* <i class="bi bi-three-dots-vertical"></i> */}
                              </small>
                                
                              {/* <div class="dropdown-content">
                                <a href="#"><i class="bi bi-pin-angle"></i> Pin Chat</a>
                                  <hr class="divider" />
                                <a href="#"><i class="bi bi-trash3"></i> Delete</a>
                              </div> */}
                            </div>
                          </div>
                        </div>
                        {/* <div className="profileImg">
                      <img
                        className="UserRateImg"
                        src={
                          chat?.profile_picture
                            ? chat?.profile_picture
                            : "/assets/images/profile.png"
                        }
                        alt="User profile"
                      />
                    </div> */}
                        {/* <div className="message-content">
                      <p className="name">{chat.name}</p>
                      <div className="message-text">
                        {chat?.type == "text" && <h5>{chat?.message}</h5>}
                        {chat?.type == "image" && (
                          <img src={chat?.message} alt="" />
                        )}
                        {chat?.type == "pdf" && (
                          <div
                            onClick={() => handlePdf(chat?.message)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginTop: "10px",
                              cursor: "pointer",
                            }}
                          >
                            <FaRegFilePdf size={24} color="red" />{" "}
                            <span style={{ marginLeft: "10px" }}>
                              {chat?.message.substring(
                                chat?.message.lastIndexOf("/") + 1
                              ) || "No PDF selected"}
                            </span>
                          </div>
                        )}
                        <p className="timestamp">
                          {chat?.date && formatTime(chat?.date)}
                        </p>
                      </div>
                    </div> */}
                      </div>
                    )
                )}
            </ul>
          </div>
        </div>
      </div>
      {/* <pre>{JSON.stringify(chatData, null, 2)}</pre> */}
      {isLocked != "1" && (
        <form
          className="chat_input pt-1 pb-0 p-0"
          onSubmit={handleUpdateStatus}
        >
          <div className="input-group">
            {imagePreviews[0] && (
              <FaTimesCircle
                onClick={handleDeleteImage}
                style={{
                  position: "absolute",
                  left: "60px", // Adjust position based on your layout
                  top: "2px",
                  cursor: "pointer",
                  color: "red",
                  fontSize: "18px",
                  zIndex: "9999",
                  height: "14px",
                  color: "#FF7426",
                }}
              />
            )}
            <div className="input-group-prepend">
              <span
                className="input-group-text border-0 rounded-0 rounded-start paperClip"
                onClick={handleFileClick}
                style={{ background: "#F5F5F5", cursor: "pointer" }}
              >
                <ImAttachment style={{ height: "26px", color: "#969696" }} />
              </span>

              <input
                type="file"
                accept=".pdf, image/png, image/jpeg, image/jpg, image/gif, audio/mpeg, audio/wav, audio/ogg"
                onChange={handleFileChange}
                ref={fileInputRef} // Assign ref to the file input
                style={{ display: "none" }}
              />
            </div>

            {/* <div style={{ position: "relative", display: "inline-block" }}> */}
            {console.log("imagePreviews", imagePreviews)}
            <input
              className="border-0 input_field form-control"
              type="text"
              value={imagePreviews[0] ? "" : input} // Disable text if image is selected
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type Something..."
              style={{
                // Conditional styles based on whether an image is selected
                backgroundImage: imagePreviews[0]
                  ? type == "audio"
                    ? `url(/assets/images/audio.png)`
                    : type == "pdf"
                    ? `url(/assets/images/pdf.png)`
                    : `url(${imagePreviews[0]})` // Show image preview if available
                  : "none",
                backgroundColor: imagePreviews[0] ? "#F5F5F5" : "#F5F5F5", // Set transparent or light gray background when no image is selected
                backgroundSize: imagePreviews[0] ? "40px 40px" : "none", // Ensure backgroundSize is applied only if image exists
                backgroundRepeat: imagePreviews[0] ? "no-repeat" : "no-repeat", // Ensure no-repeat is applied
                backgroundPosition: imagePreviews[0] ? "left center" : "none", // Position the image on the left if it's set
                paddingLeft: imagePreviews[0] ? "50px" : "0px", // Add padding to make space for the preview
              }}
              disabled={!!imagePreviews[0]} // Disable input when an image is selected
            />

            {/* Delete icon over the image */}
            {/* </div> */}

            {/* {Emoji Picker} */}
            {/* <div className="input-group-append" onClick={() => setShowPicker(!showPicker)}>
            <span
              className="input-group-text border-0 rounded-0 rounded-end"
              style={{ padding: "9px 5px", background: "#F5F5F5", cursor: 'pointer' }}
            >
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6730_5295)">
                  <path
                    d="M23.9997 11.2915V12.6979C23.9819 12.7641 23.9683 12.8314 23.9589 12.8993C23.8616 14.5578 23.393 16.1733 22.5875 17.6263C20.3786 21.5568 17.0083 23.6985 12.5031 23.9757C10.3753 24.1165 8.2526 23.636 6.39292 22.5926C2.44496 20.3925 0.303169 17.0135 0.0201293 12.5024C-0.114389 10.3689 0.367771 8.24175 1.40907 6.37476C2.25436 4.76054 3.46139 3.36359 4.93588 2.29303C6.41037 1.22247 8.11239 0.507284 9.90901 0.203336C10.3671 0.115798 10.834 0.0749485 11.2979 0.0136719H12.7044C12.7633 0.0321773 12.8239 0.0448789 12.8853 0.051602C14.338 0.138214 15.7597 0.508986 17.0696 1.14291C20.7637 2.95203 23.0193 5.88164 23.81 9.92589C23.9005 10.3665 23.9384 10.8334 23.9997 11.2915ZM11.9983 1.49598C9.92065 1.49598 7.88972 2.11206 6.16225 3.26632C4.43478 4.42058 3.08838 6.06116 2.29332 7.98062C1.49825 9.90008 1.29023 12.0122 1.69555 14.0499C2.10088 16.0876 3.10133 17.9593 4.57042 19.4284C6.03951 20.8975 7.91125 21.8979 9.94894 22.3033C11.9866 22.7086 14.0987 22.5006 16.0182 21.7055C17.9376 20.9104 19.5782 19.564 20.7325 17.8366C21.8867 16.1091 22.5028 14.0781 22.5028 12.0005C22.502 9.21506 21.395 6.54394 19.4251 4.57458C17.4552 2.60522 14.7837 1.4989 11.9983 1.4989V1.49598Z"
                    fill="#969696"
                  />
                  <path
                    d="M5.24023 12.0098H6.72841C6.72841 13.4059 7.28297 14.7448 8.27015 15.7319C9.25734 16.7191 10.5962 17.2737 11.9923 17.2737C13.3884 17.2737 14.7273 16.7191 15.7145 15.7319C16.7017 14.7448 17.2563 13.4059 17.2563 12.0098H18.7474C18.6715 14.3295 17.7494 16.2233 15.8294 17.5276C13.5826 19.0537 11.1607 19.1908 8.78261 17.9069C6.49203 16.6697 5.35987 14.6359 5.24023 12.0098Z"
                    fill="#969696"
                  />
                  <path
                    d="M6.75198 8.25857C6.75024 7.96144 6.8368 7.6705 7.00067 7.42264C7.16455 7.17478 7.39835 6.98119 7.67242 6.86641C7.94649 6.75164 8.24848 6.72085 8.54007 6.77797C8.83166 6.83509 9.09971 6.97753 9.31023 7.18722C9.52074 7.39691 9.66423 7.66441 9.72249 7.95577C9.78074 8.24714 9.75113 8.54924 9.63743 8.82376C9.52372 9.09827 9.33105 9.33283 9.08383 9.49767C8.83662 9.66251 8.54601 9.75021 8.24888 9.74963C7.85405 9.74586 7.47636 9.58773 7.19661 9.30908C6.91687 9.03043 6.7573 8.65338 6.75198 8.25857Z"
                    fill="#969696"
                  />
                  <path
                    d="M15.7507 9.74964C15.4535 9.7502 15.1628 9.66243 14.9155 9.49746C14.6682 9.33248 14.4755 9.09776 14.3619 8.82307C14.2483 8.54838 14.2189 8.24613 14.2774 7.95469C14.3359 7.66325 14.4796 7.39575 14.6904 7.18618C14.9013 6.97661 15.1696 6.8344 15.4614 6.77762C15.7531 6.72084 16.0552 6.75204 16.3292 6.86726C16.6032 6.98249 16.8368 7.17653 17.0004 7.42477C17.1639 7.67301 17.2499 7.96424 17.2476 8.26149C17.2423 8.65602 17.0826 9.03277 16.8028 9.31095C16.523 9.58914 16.1453 9.74662 15.7507 9.74964Z"
                    fill="#969696"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6730_5295">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
          </div> */}
          </div>
          <button
            className="btn p-0 text-white"
            style={{ width: "15%" }}
            type="submit"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="52" height="52" rx="10" fill="#526170" />
              <rect
                width="52"
                height="52"
                rx="10"
                fill="url(#paint0_linear_6730_5285)"
              />
              <path
                d="M17.8473 19.0156L29.4356 15.169C34.636 13.4429 37.4614 16.27 35.7416 21.4485L31.8788 32.988C29.2854 40.749 25.0268 40.749 22.4335 32.988C21.7117 30.8318 20.0053 29.1375 17.8473 28.4212C10.0535 25.8387 10.0535 21.6116 17.8473 19.0156Z"
                fill="white"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.1387 31.4476L23.4367 28.1543"
                stroke="#F67100"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_6730_5285"
                  x1="4.97391"
                  y1="-10.9032"
                  x2="-22.5706"
                  y2="18.7151"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.034523" stopColor="#F4780E" />
                  <stop offset="0.944296" stopColor="#EF991C" />
                </linearGradient>
              </defs>
            </svg>
          </button>
        </form>
      )}
      {/* {showPicker && <EmojiPicker 
          onEmojiClick={onEmojiClick} 
          // searchDisabled={true}
          // skinTonesDisabled={true}
          // reactions={true}
          // suggestedEmojisMode ={false}
          emojiStyle = {'google'}
           />} */}

      {/* <div class="chat_input">
        <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text border-0  paperClip" data-toggle="modal" data-target="#fileUpload">
                  <i class="bi bi-paperclip"></i>
              </span>
            </div>
            <input type="text" class=" border-0 input_field form-control" placeholder="Type Something..." />
            <div class="input-group-append">
              <span class="input-group-text border-0  mic_icon">
                <i class="fa fa-smile-o" aria-hidden="true"></i>
              </span>
            </div>
        </div>
        <button class="btn btn-warning bg_color text-white" style="width: 15%;">
          <i class="bi bi-send-fill" style="font-size: 20px;"></i>
        </button>
      </div> */}
    </>
  );
};

export default LiveChat;
