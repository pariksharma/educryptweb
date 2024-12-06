import React, { useState, useEffect } from 'react';
import VideoPlayerDRM from '@/component/player';
import { useRouter } from 'next/router';
import Head from 'next/head';
import mqtt from 'mqtt';
import Chat from '@/component/chat/chat';
import { decrypt, encrypt, get_token } from '@/utils/helpers';
import { addBookmarkService, deleteBookmarkService, getContentMeta } from '@/services';
import { getDatabase, ref, onValue, update, push } from "firebase/database";
import { initializeApp } from "firebase/app";
import Header from '@/component/header/header';
import Bookmark from '@/component/bookmark/bookmark';
import BookmarkModal from '@/component/modal/bookmarkModal';
import { toast } from 'react-toastify';

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
    const [triggerChildFunction, setTriggerChildFunction] = useState(() => () => {});
    const [togglePlayPause, setTogglePlayPause] = useState({});
    const [addBookmark, setAddBookmark] = useState(false)
    const [bookMarkData, setBookMarkData] = useState([])
    const [indexData, setIndexData] = useState([])
    const [bookmarkTime, setBookmarkTime] = useState('')
    const [getVideoTime, setGetVideoTime] = useState('')
    const [trigger, setTrigger] = useState(0)
    const [toastTrigger, setToastTrigger] = useState(0)
    const [succesToastMsg, setSuccessToastMsg] = useState('')
    const [errorToastMsg, setErrorToastMsg] = useState('')
    // const [getCurrTime, setGetCurrTime] = useState({ action: null, state: "0:00" })

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
                // console.log("hello")
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
          // console.log('chatNode', chatNode)
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

      const handleBookMark = () => {
        // console.log('getVideoTime', getVideoTime)
        if(getVideoTime > 1){ 
          // console.log('toggle')
          setAddBookmark(!addBookmark)
          if (togglePlayPause.action) {
            togglePlayPause.action(); // Call the child's function
          }
        } else {
          setErrorToastMsg("Video is not started yet!")
          setToastTrigger(() => toastTrigger + 1)
        }
      }

      // console.log('addBookmark', addBookmark)

      useEffect(() => {
        // This will run whenever `togglePlayPause` changes
        console.log("Updated togglePlayPause:", togglePlayPause);
      }, [togglePlayPause]);

      const fetchContentMeta = async () => {
        try {
          const userId = localStorage.getItem('user_id') 
          const token = get_token();
          const formData = {
              token : router.query.video_id,
              user_id: userId
          }
          const response_contentMeta_service = await getContentMeta(encrypt(JSON.stringify(formData), token));
          const response_contentMeta_data = decrypt(response_contentMeta_service.data, token);
          // console.log('response_contentMeta_data', response_contentMeta_data)
          if(response_contentMeta_data.status){
            setBookMarkData(response_contentMeta_data?.data?.bookmark)
            setIndexData(response_contentMeta_data?.data?.index)
          }
          else{
            setPublicChat(0)
            setErrorToastMsg(response_contentMeta_data.message)
            setToastTrigger(() => toastTrigger + 1)
            // toast.error(response_contentMeta_data.message);
            if (
              response_contentMeta_data.message ==
              "You are already logged in with some other devices, So you are logged out from this device. 9"
            ) {
              localStorage.removeItem("jwt");
              localStorage.removeItem("user_id");
              localStorage.removeItem('userName')
              router.pathname.startsWith("/private")
                ? router.push("/")
                : location.reload();
            }
          }
        } catch (error) {
          console.log('error found: ', error)
        }
      }


      const submitBookmark = async (e, title) => {
        e.preventDefault()
        try {
          const token = get_token()
          const formData = {
            user_id: localStorage.getItem('user_id'),
            video_id : router.query.video_id,
            time : togglePlayPause?.state,
            info: title,
          }
          // console.log('titleformData', formData)
          const response_addBookmark_service = await addBookmarkService(encrypt(JSON.stringify(formData), token))
          const response_addBookmark_data = decrypt(response_addBookmark_service.data, token);
          // console.log('response_addBookmark_data', response_addBookmark_service)
          if(response_addBookmark_data.status) {
            // toast.success("Added Successfully");
            setSuccessToastMsg("Added Successfully");
            setToastTrigger(() => toastTrigger + 1)
            fetchContentMeta()
            handleBookMark()
          }
          else {
            // toast.error(response_addBookmark_data.message);
            setErrorToastMsg(response_addBookmark_data.message)
            setToastTrigger(() => toastTrigger + 1)
            if (
              response_addBookmark_data.message ==
              "You are already logged in with some other devices, So you are logged out from this device. 9"
            ) {
              localStorage.removeItem("jwt");
              localStorage.removeItem("user_id");
              localStorage.removeItem('userName')
              router.pathname.startsWith("/private")
                ? router.push("/")
                : location.reload();
            }
          }

        } catch (error) {
          console.log('error found: ', error)
        }
      }

      const deleteBookMark = async (bookmark_id) => {
        try {
          const token = get_token()
          const formData = {
            index_id : bookmark_id
          }
          const response_deleteBookmark_service = await deleteBookmarkService(encrypt(JSON.stringify(formData), token))
          const response_deleteBookmark_data = decrypt(response_deleteBookmark_service.data, token)
          // console.log('response_deleteBookmark_data', response_deleteBookmark_data)
          if(response_deleteBookmark_data.status) {
            setSuccessToastMsg(response_deleteBookmark_data.message)
            setToastTrigger(() => toastTrigger + 1)
            // toast.success(response_deleteBookmark_data.message)
            fetchContentMeta()
          }
          else {
            // toast.error(response_deleteBookmark_data.message);
            setErrorToastMsg(response_deleteBookmark_data.message)
            setToastTrigger(() => toastTrigger + 1)
            if (
              response_deleteBookmark_data.message ==
              "You are already logged in with some other devices, So you are logged out from this device. 9"
            ) {
              localStorage.removeItem("jwt");
              localStorage.removeItem("user_id");
              localStorage.removeItem('userName')
              router.pathname.startsWith("/private")
                ? router.push("/")
                : location.reload();
            }
          }
        } catch (error) {
          console.log('error found: ', error)
        }
      }

      const handleCurrentTime = (bookmark) => {
        // console.log('bookmark', bookmark)
        setBookmarkTime(bookmark?.time)
        setTrigger(() => trigger + 1)
      }



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
                  <>
                  <Header />
                    {addBookmark && 
                      <BookmarkModal
                        show={addBookmark}
                        onHide={handleBookMark}
                        time = {togglePlayPause.state}
                        submitBookmark = {submitBookmark}
                      />}
                    <div className="container-fluid live-main-container">
                      <div className="row" style={{ height: "100%" }}>
                        <div
                          className="col-md-9 mb-5"
                          style={{ height: "100%" }}
                        >
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
                            executeFunction={setTriggerChildFunction}
                            setTogglePlayPause={setTogglePlayPause}
                            bookmarkTime = {bookmarkTime} 
                            trigger = {trigger}
                            getValue = {(value) => setGetVideoTime(value)}
                        />
                        <p className="liveTitleHeading">
                            {router?.query?.title}
                          </p>
                        </div>
                        <div
                          className="col-md-3 mb-5"
                          style={{ height: "100%" }}
                        >
                          <Bookmark
                            chat_node={router.query.chat_node}
                            course_id={router.query.course_id}
                            video_id={router.query.video_id}
                            handleBookMark = {handleBookMark}
                            bookMarkData = {bookMarkData}
                            indexData = {indexData}
                            deleteBookMark = {deleteBookMark}
                            handleCurrentTime = {handleCurrentTime}
                            succesToastMsg = {succesToastMsg}
                            errorToastMsg = {errorToastMsg}
                            toastTrigger = {toastTrigger}
                          />
                        </div>
                    </div>
                  </div>
                </>
                );
            case 8:
                return (
                  <>
                    <Header />
                    <div className="container-fluid live-main-container">
                      <div className="row" style={{ height: "100%" }}>
                        <div
                          className="col-md-9 mb-5"
                          style={{ height: "100%" }}
                        >
                          <VideoPlayerDRM
                            vdc_id={router?.query?.vdc_id}
                            NonDRMVideourl={router?.query?.file_url}
                            item={null}
                            title={router?.query?.title}
                            videoMetaData={null}
                            start_date={router.query.start_date}
                            end_date={router.query.end_date}
                            video_type={router.query.video_type}
                            chat_node={router.query.chat_node}
                            course_id={router.query.course_id}
                            setTogglePlayPause={setTogglePlayPause} 
                            bookmarkTime = {bookmarkTime}
                            trigger = {trigger}
                            getValue = {(value) => setGetVideoTime(value)}
                          />
                          <p className="liveTitleHeading">
                            {router?.query?.title}
                          </p>
                        </div>
                        <div
                          className="col-md-3 mb-5"
                          style={{ height: "100%" }}
                        >
                          <Chat
                            chat_node={router.query.chat_node}
                            course_id={router.query.course_id}
                            video_id={router.query.video_id}
                          />
                        </div>
                      </div>
                    </div>
                  </>
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
                  <>
                    <Header />
                    <div className="container-fluid live-main-container">
                      <div className="row" style={{ height: "100%" }}>
                        <div
                          className="col-md-9 mb-5 position-relative"
                          style={{ height: "100%" }}
                        >
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

                        <div
                          className="col-md-3 mb-5"
                          style={{ height: "100%" }}
                        >
                          <Chat
                            chat_node={router.query.chat_node}
                            course_id={router.query.course_id}
                            video_id={router.query.video_id}
                          />
                        </div>
                      </div>
                    </div>
                  </>
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
