import React, { useEffect, useRef, useState } from 'react'
import mqtt from 'mqtt';
import { format } from "date-fns";

const MQTTchat = ({listenURL, port, settingNode, chatNode, course_id, isPublic, locked_room, key}) => {

    const [client, setClient] = useState(null);
    const [connectStatus, setConnectStatus] = useState(null);
    const [input, setInput] = useState('')
    const [chatData, setChatData] = useState([])
    const [userId, setUserId] = useState('')
    const [isLocked, setIsLocked] = useState('')
    const [lockUserId, setLockUserId] = useState('')
    const chatContainerRef = useRef(null);
    const [roomLocked, setRoomLocked] = useState(locked_room)

  ////////////////// MQTT Connection ////////////////
    const mqttConnect = (host) => {
      const jwt = localStorage.getItem("jwt");
      const userName = localStorage.getItem("userName");
      const user_id = localStorage.getItem("user_id");
      const options = {
        clientId: user_id, // Use USER_ID as the clientId
        username: userName,   // Use Name as the username
        password: jwt,
        clean: false,
      };
        console.log('hoptionsost', options)
        setConnectStatus("Connecting");
        const MQTTClient = mqtt.connect(host, options)
        setClient(MQTTClient);
        if (MQTTClient) {
          if(!MQTTClient.subscribed) {
            MQTTClient.on("connect", () => {
              console.log('connect')
              setConnectStatus("Connected");
              MQTTClient.subscribe(chatNode, { qos: 2 }, (err) => {
                if (err) {
                  console.error("Subscription error:", err);
                } else {
                  console.log(`Subscribed to chatNode "${chatNode}"`);
                  // getChatData();
                }
              });
        
              MQTTClient.subscribe(settingNode, { qos: 2 }, (err) => {
                if (err) {
                  console.error("Subscription error:", err);
                } else {
                  console.log(`Subscribed to settingNode "${settingNode}"`);
                  // getUserData()
                }
              });
              MQTTClient.subscribed = true;
            });
          }
      
          MQTTClient.on("error", (err) => {
            console.error("Connection error: ", err);
            MQTTClient.end();
          });
      
          MQTTClient.on("reconnect", () => {
            setConnectStatus("Reconnecting");
          });
        }
      };

      console.log('isPublic', isPublic)
      

      // console.log('client', client)
      ////////////////// MQTT Connection Credential ////////////////

  const brokerUrl = `wss://chat-ws.videocrypt.in:8084/mqtt`;

  useEffect(() => {
    mqttConnect(brokerUrl);
  }, []);

  ////////////////// getting data from MQTT ////////////////

  useEffect(() => {
    if (client) {
      getChatData()
      getUserData()
    }
  }, [client]);


  useEffect(() => {
    // Scroll to the bottom when chatData changes
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatData]);
  
  const getChatData = () => {
    // console.log('getChatData')
    const user_id = localStorage.getItem("user_id");
    client.on("message", (chatNode, message) => {
        // console.log(`Received message on topic "${topic}": ${message}`);
        if(isPublic != '0'){
          setChatData((prevChatData) => [
              ...prevChatData,
              JSON.parse(message.toString()), // Parse the message if it's JSON
          ]);
        }
        else {
          console.log(JSON.parse(message.toString()))
          if(JSON.parse(message.toString())?.platform == '0' || JSON.parse(message.toString())?.id == user_id) {
            console.log('chatData comes from here')
            setChatData((prevChatData) => [
            ...prevChatData, 
            JSON.parse(message.toString())
          ])
          }
          else if(JSON.parse(message.toString())?.type == "user_lock" || JSON.parse(message.toString())?.type == "user_unlock") {
            setIsLocked(JSON.parse(message.toString())?.type)
            setRoomLocked(JSON.parse(message.toString())?.type)
            setLockUserId(JSON.parse(message.toString())?.locked_user_id)
          }
          // const chats = JSON.parse(message.toString()).filter((chat) => ())
          
        }
    });
  };

  const getUserData = () => {
    // console.log('getUserData')
    client.on("message", (settingNode, message) => {
      console.log(`Received message on topic "${settingNode}": ${message}`);
      // console.log('')
      if(JSON.parse(message.toString())?.type == "user_unlock" || JSON.parse(message.toString())?.type == "user_lock"){
        setIsLocked(JSON.parse(message.toString())?.type)
        setRoomLocked(JSON.parse(message.toString())?.type)
        setLockUserId(JSON.parse(message.toString())?.locked_user_id)
      }
    });
  }

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

// console.log('chatData', chatData)

  const handleMessge = (e) => {
    e.preventDefault();
    const app_id = localStorage.getItem("appId");
    const user_id = localStorage.getItem("user_id");
    const userName = localStorage.getItem("userName");
    setUserId(localStorage.getItem("user_id"))
    // console.log('hi', input)
    const curr_date = new Date();
    if (input) {
      let msgObject = JSON.stringify({
        id : user_id,
        message : input,
        name : userName,
        date : convertToTimestamp(curr_date),
        platform : '4',
        type : 'text',
        course_id : course_id,
        pin: '0',
        is_active: '1'
      });
      client.publish(chatNode, msgObject, { qos: 1 }, (err) => {
        if (err) {
          console.error("Error publishing message:", err);
        } else {
          console.log(` Message published to topic "${chatNode}": ${input}`);
          // getChatData()
        setInput('')
        }
      });
    }
  };




  return ( <>
    <div className="chat-conversation" >
        {console.log('caht', chatData)}
        <div className="simplebar-content-wrapper">
          <div
            className="simplebar-content live-content"
            style={{ overflowY: "hidden" }}
            ref={chatContainerRef}
          >
            <ul
              className="list-unstyled chat-conversation-list"
              id="chat-conversation-list"
            >
              {chatData?.length > 0 &&
                chatData.map((chat, index) => (
                  (chat?.type == 'text' && chat?.message != "")  &&
                  <div
                    key={index}
                    className={`chat-list ${userId === chat.id ? "right" : "left"}`}
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

                              {chat?.type == "text" && chat?.message}
                              {chat?.type == "image" && (
                                <img src={chat?.message} className="w-100" alt="" />
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
                              {chat?.type == "audio" && <AudioPlayer
                                  audioUrl={chat?.message}
                                  userName="Ankur Tiwari"
                                  duration={chat?.date && formatTime(chat?.date)}
                                />
                                }
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
                            {/* <i className="bi bi-three-dots-vertical"></i> */}
                          </small>
                        </div>
                      
                      </div>
                    </div>
                  </div>
                ))}
            </ul>
          </div>
        </div>
      </div>
      {console.log('isLocked', isLocked)}
      {console.log('roomLocked', roomLocked)}
      {roomLocked != "room_lock" && (
        isLocked != "user_lock" &&
        <form className="chat_input pt-1 pb-0 p-0" onSubmit={handleMessge}>
          <div className="input-group">
            <input
              className="border-0 input_field form-control"
              type="text"
              value={input} // Disable text if image is selected
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type Something..."
            />
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
    </>
  )
}

export default React.memo(MQTTchat)