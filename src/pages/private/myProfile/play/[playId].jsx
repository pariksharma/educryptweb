import React, { useState, useEffect } from 'react';
import VideoPlayerDRM from '@/component/player';
import { useRouter } from 'next/router';
import Head from 'next/head';
import mqtt from 'mqtt';
import Chat from '@/component/chat/chat';
import { decrypt, encrypt, get_token } from '@/utils/helpers';
import { getContentMeta } from '@/services';
import { getDatabase, ref, onValue, update, push } from "firebase/database";
import { initializeApp } from "firebase/app";


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

const app = initializeApp(firebaseConfig);
  const database = getDatabase(app); // Get Firebase Realtime Database instance

const PlayId = () => {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });
    const [isLoading, setIsLoading] = useState(true); 
    const router = useRouter();
    // console.log("router",router)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });

            const handleResize = () => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            };

            window.addEventListener('resize', handleResize);

            // Clean up the event listener on component unmount
            return () => {
                console.log("hello")
                handleUserOffline()
                handleUserOfflineMQTT()
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    const handleUserOffline = () => {
        try {
          const app_id = localStorage.getItem("appId");
          const user_id = localStorage.getItem("user_id");
            const chatNode = localStorage.getItem("chat_node");
            const curr_date = new Date();
            console.log('chatNode', chatNode)
          const userStatusRef = ref(
            database,
            `${app_id}/chat_master/${chatNode}/User/${user_id}`
          );
      
          // Update only the 'online' field
          update(userStatusRef, {
            online: convertToTimestamp(curr_date), // Set to an empty string to indicate offline
          })
            .then(() => {
              console.log("User 'online' status updated to offline.");
            })
            .catch((error) => {
              console.error("Error updating 'online' status:", error);
            });
        } catch (error) {
          console.error("Error updating user offline status:", error);
        }
      };


      const handleUserOfflineMQTT = () => {
        try {
            const brokerUrl = `wss://chat-ws.videocrypt.in:8084/mqtt`;
            const jwt = localStorage.getItem("jwt");
            const chatNode = localStorage.getItem("chat_node");
            const settingNode = localStorage.getItem("setting_node");
            const options = {
                clientId: localStorage.getItem("user_id"),
                username: localStorage.getItem("userName"),
                password: jwt,
            };
            const MQTTClient = mqtt.connect(brokerUrl, options);

            MQTTClient.unsubscribe(chatNode, (err) => {
                if (!err) console.log(`Unsubscribed from ${chatNode}`);
            });
            MQTTClient.unsubscribe(settingNode, (err) => {
                if (!err) console.log(`Unsubscribed from ${settingNode}`);
            });
            MQTTClient.end(() => console.log("Disconnected from MQTT."));
        } catch (error) {
            console.error("Error during MQTT unsubscription:", error);
        }
    };

      const convertToTimestamp = (dateString) => {
        const date = new Date(dateString);
        return date.getTime(); // Convert milliseconds to seconds
      };

    useEffect(() => {
        // Check if router is ready
        if (router.isReady) {
            // Ensure to set loading to false when the router is ready
            setIsLoading(false);
        }
    }, [router.isReady]);

    const renderPlayer = () => {
        const videoType = parseInt(router?.query?.video_type);

        if (isLoading) {
            return <p>Loading...</p>; // Display loading state
        }

        switch (videoType) {
            case 7:
                return (
                    <VideoPlayerDRM
                        vdc_id={router?.query?.vdc_id}
                        NonDRMVideourl={router?.query?.file_url}
                        item={null}
                        title={router?.query?.title}
                        videoMetaData={null}
                        start_date={router.query.start_date}
                        end_date={router.query.end_date}
                        video_type={router.query.video_type}
                        chat_node = {router.query.chat_node}
                        course_id={router.query.course_id}
                    />
                );
            case 8:
                return (
                    <div className="container-fluid live-main-container">
                        <div className="row" style={{height: "100%"}}>
                            <div className="col-md-8" style={{height: "100%"}}>
                                <VideoPlayerDRM
                                    vdc_id={router?.query?.vdc_id}
                                    NonDRMVideourl={router?.query?.file_url}
                                    item={null}
                                    title={router?.query?.title}
                                    videoMetaData={null}
                                    start_date={router.query.start_date}
                                    end_date={router.query.end_date}
                                    video_type={router.query.video_type}
                                    chat_node = {router.query.chat_node}
                                    course_id={router.query.course_id}
                                />
                                <p className="liveTitleHeading">
                                  {router?.query?.title}
                                </p>
                            </div>
                            <div className="col-md-4" style={{height: "100%"}}>
                                <Chat 
                                    chat_node = {router.query.chat_node}
                                    course_id={router.query.course_id}
                                    video_id = {router.query.video_id}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                  <iframe
                    id="youtubePlayer"
                    className="youtubePlayer"
                    width={windowSize.width}
                    height={windowSize.height - 10}
                    src={`https://www.youtube.com/embed/${router?.query?.file_url}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
            case 4:
                return (
                  <div className="container-fluid live-main-container">
                    <div className="row" style={{height: "100%"}}>
                      <div className="col-md-8 mb-5 position-relative" style={{height: "100%"}}>
                        <iframe
                          id="youtubePlayer"
                          className="youtubePlayer"
                          width="100%"
                          height="100%"
                          // height={windowSize.height - 10}
                          src={`https://www.youtube.com/embed/${router?.query?.file_url}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />

                        {/* <img className="live_VideoImg" src="/assets/images/live_VideoImg.gif"
                          alt=""
                        /> */}

                        <p className="liveTitleHeading">
                          {router?.query?.title}
                        </p>
                      </div>

                      <div className="col-md-4 mb-5" style={{height: "100%"}}>
                        <Chat
                          chat_node={router.query.chat_node}
                          course_id={router.query.course_id}
                          video_id={router.query.video_id}
                        />
                      </div>
                    </div>
                  </div>
                );
            default:
                return <p>No supported video format found.</p>;
        }
    };

    return (
        <>
            <Head>
                <title>{router?.query?.title}</title>
                <meta name={router?.query?.title} content={router?.query?.title} />
            </Head>
            {renderPlayer()}
        </>
    );
};

export default PlayId;
