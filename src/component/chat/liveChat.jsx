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

  // useEffect(() => {
  //   // Function to apply overflow style based on viewport size
  //   const updateOverflowStyle = () => {
  //     const currentUrl = window.location.href;
  //     const viewportWidth = window.innerWidth;

  //     // Check if the URL matches the desired page
  //     if (currentUrl.includes("/private/myProfile/play/")) {
  //       // Apply overflow: hidden for smaller devices (<= 1024px)
  //       if (viewportWidth <= 1024) {
  //         document.documentElement.style.overflow = "hidden";
  //       } else {
  //         document.documentElement.style.overflow = "auto"; // Remove overflow: hidden for larger devices
  //       }
  //     } else {
  //       document.documentElement.style.overflow = "auto"; // Reset for other pages
  //     }
  //   };

  //   // Apply the overflow style when the component mounts
  //   updateOverflowStyle();

  //   // Listen for window resize events to update the overflow style dynamically
  //   window.addEventListener("resize", updateOverflowStyle);

  //   // Cleanup: remove the event listener when the component unmounts
  //   return () => {
  //     window.removeEventListener("resize", updateOverflowStyle);
  //   };
  // }, []); 



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
                                      className="w-100"
                                      alt=""
                                    />
                                  )}
                                  {chat?.type == "pdf" && (
                                    <div
                                      className="pdf_file"
                                      onClick={() => handlePdf(chat?.message)}
                                    >
                                      {/* <FaRegFilePdf size={24} color="red" />{" "} */}
                                      <svg
                                        width="20"
                                        height="40"
                                        viewBox="0 0 20 26"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <g clip-path="url(#clip0_7165_4729)">
                                          <path
                                            d="M19.9941 8.01707C19.9881 7.87993 19.9349 7.7496 19.8443 7.64986C17.4561 5.1512 15.062 2.65938 12.662 0.174396C12.5591 0.0737222 12.4248 0.014775 12.2837 0.00822953C9.0443 2.37518e-05 5.80489 2.37518e-05 2.56548 0.00822953C2.20636 0.00245272 1.84981 0.0722284 1.51721 0.213374C0.482729 0.69136 0.00390625 1.56938 0.00390625 2.7346C0.00390625 6.15367 0.00390625 9.56659 0.00390625 12.9734C0.00390625 16.3801 0.00390625 19.7992 0.00390625 23.2306C0.00390625 24.843 1.04824 25.9713 2.56548 25.9734C7.52049 25.9734 12.4775 25.9734 17.4364 25.9734C18.9182 25.9734 19.998 24.8676 19.998 23.3208C20.0072 18.2278 20.0059 13.1265 19.9941 8.01707ZM6.29947 18.7995C5.83317 18.9216 5.35904 19.0086 4.88075 19.06V20.7976H3.77534C3.77534 20.7032 3.75957 20.615 3.75957 20.5247C3.75957 19.0128 3.75957 17.5009 3.75957 15.989C3.75957 15.7838 3.80095 15.671 4.02755 15.6731C4.70736 15.6731 5.39307 15.6156 6.06499 15.6936C6.40041 15.7213 6.71455 15.8756 6.94826 16.1276C7.18198 16.3797 7.31915 16.7119 7.33396 17.0619C7.38519 17.905 7.03642 18.5512 6.29947 18.7995ZM12.4335 18.5533C12.2482 19.9606 11.5014 20.6663 9.99799 20.8345C9.35496 20.8736 8.71041 20.8777 8.06696 20.8468V18.6682C8.06696 17.7635 8.06696 16.8588 8.06696 15.9562C8.06696 15.7674 8.11031 15.6751 8.30538 15.6772C9.01671 15.6772 9.73395 15.6013 10.4354 15.6772C11.8876 15.8536 12.6305 17.0024 12.4256 18.5533H12.4335ZM16.2384 16.6024H14.3606V17.7737H16.1103V18.7338H14.3507V20.7996H13.2354V15.6546H16.2305L16.2384 16.6024ZM11.2748 9.07356V2.72639L17.3832 9.07356H11.2748Z"
                                            fill="url(#paint0_linear_7165_4729)"
                                          />
                                          <path
                                            d="M8.05859 20.8509V18.6682C8.05859 17.7635 8.05859 16.8588 8.05859 15.9562C8.05859 15.7674 8.10195 15.6751 8.29702 15.6772C9.00835 15.6772 9.72559 15.6013 10.4271 15.6772C11.8911 15.8495 12.634 16.9983 12.429 18.5492C12.2438 19.9565 11.497 20.6622 9.99357 20.8304C9.34937 20.8724 8.70349 20.8792 8.05859 20.8509ZM9.19751 19.9462C9.96007 20.0037 10.6458 19.936 11.0478 19.1728C11.3867 18.5287 11.3138 17.4988 10.9157 17.0086C10.5532 16.5634 9.81032 16.3808 9.19751 16.588V19.9462Z"
                                            fill="white"
                                          />
                                          <path
                                            d="M4.87118 19.06V20.7976H3.76576C3.76576 20.7032 3.75 20.615 3.75 20.5248C3.75 19.0129 3.75 17.5009 3.75 15.989C3.75 15.7839 3.79138 15.671 4.01798 15.6731C4.69778 15.6731 5.38349 15.6157 6.05542 15.6936C6.39084 15.7213 6.70497 15.8757 6.93869 16.1277C7.1724 16.3797 7.30957 16.712 7.32438 17.0619C7.38941 17.9051 7.04064 18.5513 6.29581 18.7995C5.82757 18.9219 5.35146 19.009 4.87118 19.06ZM4.87118 18.141C5.19182 18.105 5.5089 18.0405 5.81897 17.9482C6.13424 17.8251 6.22882 17.5173 6.21305 17.1727C6.21709 17.0324 6.17493 16.8949 6.09358 16.7829C6.01222 16.671 5.89655 16.5914 5.76576 16.5573C5.52933 16.5065 5.2875 16.4886 5.04655 16.5039C4.98941 16.5039 4.88694 16.6209 4.88497 16.6886C4.8633 17.1399 4.86921 17.585 4.86921 18.141H4.87118Z"
                                            fill="white"
                                          />
                                          <path
                                            d="M16.2295 16.6023H14.3517V17.7737H16.1014V18.7338H14.3418V20.7996H13.2266V15.6545H16.2295V16.6023Z"
                                            fill="white"
                                          />
                                          <path
                                            d="M9.19531 19.9421V16.5839C9.80812 16.3788 10.551 16.5593 10.9135 17.0044C11.3076 17.4947 11.3845 18.5246 11.0456 19.1687C10.6436 19.9319 9.95787 19.9996 9.19531 19.9421Z"
                                            fill="#9D9D9D"
                                          />
                                          <path
                                            d="M4.86719 18.141C4.86719 17.585 4.86719 17.1398 4.86719 16.7049C4.86719 16.6372 4.97162 16.5203 5.02877 16.5203C5.26971 16.505 5.51155 16.5229 5.74798 16.5736C5.87877 16.6077 5.99444 16.6874 6.07579 16.7993C6.15715 16.9112 6.1993 17.0488 6.19526 17.1891C6.21694 17.5337 6.12236 17.8414 5.80118 17.9645C5.49515 18.0505 5.18272 18.1095 4.86719 18.141Z"
                                            fill="#9D9D9D"
                                          />
                                        </g>
                                        <defs>
                                          <linearGradient
                                            id="paint0_linear_7165_4729"
                                            x1="1.11998"
                                            y1="1.2376"
                                            x2="19.5101"
                                            y2="23.6191"
                                            gradientUnits="userSpaceOnUse"
                                          >
                                            <stop stop-color="#C4C4C4" />
                                            <stop
                                              offset="1"
                                              stop-color="#969696"
                                            />
                                          </linearGradient>
                                          <clipPath id="clip0_7165_4729">
                                            <rect
                                              width="20"
                                              height="26"
                                              fill="white"
                                            />
                                          </clipPath>
                                        </defs>
                                      </svg>
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
