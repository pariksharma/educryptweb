import React, { useState, useEffect } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update, push, set } from 'firebase/database';
import LiveChat from './liveChat';
import MQTTchat from './MQTTchat';
import { decrypt, encrypt, get_token } from '@/utils/helpers';
import { getContentMeta } from '@/services';
// import Header from '../header/header';
import Loader from '../loader';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import LivePoll from './LivePoll';
import MQTTLivePoll from './MQTTLivePoll';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8ISZRq949XJrbNeZm0gK54d9Q3zAzBtI",
  authDomain: "lab-elsaq-education.firebaseapp.com",
  databaseURL: "https://lab-elsaq-education-default-rtdb.firebaseio.com",
  projectId: "lab-elsaq-education",
  storageBucket: "lab-elsaq-education.appspot.com",
  messagingSenderId: "413835077933",
  appId: "1:413835077933:web:e9ad389b4f0e203dfa0ba4",
  measurementId: "G-1527TMN738"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Get Firebase Realtime Database instance

const Chat = ({chat_node, course_id, video_id}) => {

  const [publicChat, setPublicChat] = useState(null);
  const [isFireBase, setIsFireBase] = useState(null);
  const [chatNode, setChatNode] = useState(null);
  const [settingNode, setSettingNode] = useState(null);
  const [port, setPort] = useState(null);
  const [listenURL, setListenURL] = useState(null);
  const [showChat, setShowChat] = useState(false)
  const [pdfData, setPdfData] = useState([]);
  const [locked_room, setLocked_room] = useState('');
  const [pollData, setPollData] = useState('')
  const [key, setKey] = useState("Live Chat");

  //////////////// Live Poll state Defines//////////////////

  const [combinedPollData, setCombinedPollData] = useState([]);
  const [timers, setTimers] = useState({});
  const [userId, setUserId] = useState("");
  const [timeLeft, setTimeLeft] = useState('');
  const [pollFirebaseIds, setPollFirebaseIds] = useState('');
  const [showBlinker, setShowBlinker] = useState(false)


  const router = useRouter()

  useEffect(() => {
    fetchContentMeta()
    // localStorage.setItem('chat_node', chat_node)
    // localStorage.setItem('setting_node', settingNode)
  }, [video_id])

  const fetchContentMeta = async () => {
    try {
        const userId = localStorage.getItem('user_id') 
        const token = get_token();
        const formData = {
            token : video_id,
            user_id: userId
        }
        const response_contentMeta_service = await getContentMeta(encrypt(JSON.stringify(formData), token));
        const response_contentMeta_data = decrypt(response_contentMeta_service.data, token);
        console.log('response_contentMeta_data', response_contentMeta_data)
        if(response_contentMeta_data.status){
            const data = response_contentMeta_data?.data?.video
            setPublicChat(data?.extra_params?.public_chat)
            setIsFireBase(response_contentMeta_data?.data?.live_chat?.is_firebase)
            setPort(response_contentMeta_data?.data?.live_chat?.port)
            setChatNode(response_contentMeta_data?.data?.live_chat?.chat_node)
            setSettingNode(response_contentMeta_data?.data?.live_chat?.setting_node)
            setListenURL(response_contentMeta_data?.data?.live_chat?.listenUrl)
            setLocked_room(response_contentMeta_data?.data?.live_chat?.type)
            // console.log('data?.live_chat?.is_firebase', data?.live_chat?.is_firebase)
            setShowChat(true)
            setPdfData(response_contentMeta_data?.data?.pdf)
            setPollData(response_contentMeta_data?.data?.poll)
            localStorage.setItem('chat_node', response_contentMeta_data?.data?.live_chat?.chat_node)
            localStorage.setItem('setting_node', response_contentMeta_data?.data?.live_chat?.setting_node)
        }
        else{
          setPublicChat(0)
          toast.error(response_contentMeta_data.message);
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

  const handleRead = (value) => {
    if (typeof window !== "undefined") {
      window.open(value.pdf_url, "_blank");
    }
  };






  /////////////////////////////Live Poll /////////////////////////////////////

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
  const database = getDatabase(app); // Firebase Realtime Database instance

  

  // Initialize timers when pollData is available
  useEffect(() => {
    if (combinedPollData?.length > 0) {
      const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
      const initialTimers = combinedPollData.reduce((acc, poll) => {
        const timeLeft = poll?.valid_till - currentTimestamp; // Calculate remaining time
        acc[poll?.valid_till] = timeLeft > 0 ? timeLeft : 0; // Prevent negative values
        return acc;
      }, {});
      setTimers(initialTimers);
    }
  }, [combinedPollData]);

  // Timer decrement effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        Object.keys(updatedTimers).forEach((key) => {
          if (updatedTimers[key] > 0) {
            updatedTimers[key] -= 1; // Decrement by 1 second
          }
        });
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Fetch poll data from Firebase
  useEffect(() => {
    if(isFireBase == '1') {
      getPollData();
      endClass()
    }
  }, [isFireBase]);

  const getPollData = () => {
    try {
      console.log('poll')
      const app_id = localStorage.getItem("appId");
      const user_id = localStorage.getItem("user_id");
      setUserId(user_id);
      const chatRef = ref(
        database,
        `${app_id}/chat_master/${chat_node}/1TO1/${user_id}`
      );
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const value = snapshot.val();
        if (value) {
          const messagesArray = Object.values(value);
          const pollRef = ref(
            database,
            `${app_id}/chat_master/${chat_node}/Poll`
          );
          const unsubscribePoll = onValue(pollRef, (snapshot) => {
            const Pollvalue = snapshot.val();
            // console.log('pollValue', Pollvalue)
            setPollFirebaseIds(Pollvalue)
            if (Pollvalue) {
              const seenObjects = new Map();
              const matchedObjects = [...messagesArray]
                .reverse()
                .filter((item) => {
                  if (seenObjects.has(item.firebase_id)) {
                    return false;
                  }
                  seenObjects.set(item.firebase_id, item);
                  return true;
                })
                .filter((item) => item.is_active === "1")
                .map((item) => Pollvalue[item.firebase_id])
                .filter((item) => (item !== undefined && item?.id));

                // console.log('matchedObjects', matchedObjects)

              setCombinedPollData(matchedObjects);
            }
          });

          return () => unsubscribePoll();
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.log(error);
    }
  };

  const renderCountdown = (validTill) => {
    const seconds = timers[validTill];
    if (seconds === undefined || seconds <= 0) {
      return "Expired";
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    setTimeLeft(seconds)
    return `${mins}:${secs < 10 ? `0${secs}` : secs}`; // Format as mm:ss
  };

  // console.log('combinedData', combinedPollData)

  const handleSubmitAnswer = (poll, myAnswer) => {
    try {
      // console.log('answer', myAnswer)
      const appId = localStorage.getItem("appId"); 
      const userId = localStorage.getItem("user_id"); 
      const userName = localStorage.getItem("userName");
      const pollSubmitData = {
        answer: myAnswer.toString(),
        name: userName,
        id: userId,
        timeleft: timeLeft.toString(),
      };
      const firbaseId = getFireBaseKey(poll.id)
      console.log('fireBaseKey', chat_node)

      if((myAnswer == poll.answer) && (poll.answer != '0')) {
        const PollAnswerRef = ref(
          database,
          `${appId}/chat_master/${chat_node}/Poll/${firbaseId}/users/${userId}`
        );
        set(PollAnswerRef, pollSubmitData)
        .then(() => {
          console.log("Poll answer Submit successfully");
          // getChatData()
          updatePollCount(poll, myAnswer, firbaseId)
        })
        .catch((error) => {
          console.error("Error Poll status:", error);
        });
      }
      else {
        updatePollCount(poll, myAnswer, firbaseId)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updatePollCount = async (poll, myAnswer, firbaseId) => {
    console.log('myAnswer', myAnswer)
    try {
      const appId = localStorage.getItem("appId"); 
      const userId = localStorage.getItem("user_id"); 
      const userName = localStorage.getItem("userName");
      const pollCountRef = ref(
        database,
        `${appId}/chat_master/${chat_node}/Poll/${firbaseId}`
      );
      let updateField = null;
      switch (parseInt(myAnswer)) {
        case 1:
          updateField = "attempt_1";
          break;
        case 2:
          updateField = "attempt_2";
          break;
        case 3:
          updateField = "attempt_3";
          break;
        case 4:
          updateField = "attempt_4";
          break;
        default:
          console.error("Invalid option selected!");
          return;
      }
      if (updateField) {
        // Increment the value of the specified field
        const newValue = (parseInt(poll[updateField], 10) + 1).toString();
  
        // Update only the specified field
        await update(pollCountRef, { [updateField]: newValue });
  
        // console.log(`${updateField} updated successfully to ${newValue}`);
      }
    } catch (error) {
      console.log('error found', error)
    }
  }

  // console.log('combinedPollData', combinedPollData)

  const getFireBaseKey = (id) => {
    for (const firebaseKey in pollFirebaseIds) {
      if (pollFirebaseIds[firebaseKey]?.id == id) {
        // console.log('key', firebaseKey)
        return firebaseKey
      }
    }
  }

  useEffect(() => {
    if(combinedPollData?.length > 0) {
      if(key != "Live Poll") {
        console.log('poll comes ')
        setShowBlinker(true)
      }
    }
  }, [combinedPollData])

  useEffect(() => {
    setShowBlinker(false)
  }, [key])


  const endClass = () => {
    console.log('endCl')
    const appId = localStorage.getItem("appId"); 
    const userId = localStorage.getItem("user_id"); 
    const userName = localStorage.getItem("userName");
    const endClassRef = ref(
      database,
      `${appId}/chat_master/${chat_node}/completevideo/`
    );
    const unsubscribe = onValue(endClassRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        // const deleteMsg = value ? Object.values(value) : [];
        if(value?.offline_status == '0'){
          router.back()
        }
        // console.log('deleteMsg', value?.offline_status)
      }
    })
    return () => unsubscribe();
  }

  


  // console.log('key222', key)

  return (
    <>
  
      <div className="container-fluid">
        <div className={`row ${showBlinker ? 'liveChatTabs' : 'liveChatTabs2'}`}>
          <div className="card p-2 col-md-12">
            <Tabs
              activeKey={key}
              onSelect={(k) => setKey(k)}
              id="uncontrolled-tab-example"
              className="mb-3"
              
            >
              
              <Tab className="liveChat" eventKey="Live Chat" title="Live Chat">
                {
                  key == "Live Chat" && (
                  isFireBase == '1' ? 
                    showChat ? 
                      <LiveChat
                        chat_node = {chat_node}
                        course_id = {course_id}
                        isPublic = {publicChat}
                        
                      />
                      :
                      <Loader />
                  :
                  showChat ? 
                    <MQTTchat
                      chatNode = {chatNode}
                      settingNode = {settingNode}
                      port = {port}
                      listenURL = {listenURL}
                      chat_node = {chat_node}
                      course_id = {course_id}
                      isPublic = {publicChat}
                      locked_room = {locked_room}
                      key = {key}
                    />
                    :
                    <Loader />
                )
                }
              </Tab>
              <Tab eventKey="Live Poll" title="Live Poll">
                {key === "Live Poll"  && (
                  isFireBase == '1' ?
                    showChat ?
                      <LivePoll
                        chat_node = {chat_node}
                        combinedPollData = {combinedPollData}
                        renderCountdown = {renderCountdown}
                        handleSubmitAnswer = {handleSubmitAnswer}
                        database = {database}
                        getFireBaseKey = {getFireBaseKey}
                      />
                      :
                      <Loader />
                    :
                      showChat ?
                        <MQTTLivePoll
                          chatNode = {chatNode}
                          settingNode = {settingNode}
                          port = {port}
                          listenURL = {listenURL}
                          chat_node = {chat_node}
                          course_id = {course_id}
                          isPublic = {publicChat}
                          locked_room = {locked_room}
                          pollData = {pollData}
                        />
                      :
                        <Loader />
                  
              )}
              </Tab>
              <Tab eventKey="PDF" title="PDF">
                {pdfData?.length > 0 && pdfData.map((pdf, index) => 
                  <div className="p-2 pdf-card mb-2" 
                    key={index} 
                    style={{cursor :'pointer'}} 
                    onClick={() => handleRead(pdf)}
                  >
                    <div className="d-flex align-items-center gap-2 flex-nowrap">
                      <div className="pdf_img_cont">
                        <img src={pdf?.pdf_thumbnail ? pdf?.pdf_thumbnail : "/assets/images/noImage.jfif"} alt="" />
                      </div>
                      <h4 className="m-0 pdf_title flex-fill"> <marquee className="mt-2" behavior="" direction=""  scrollamount="5">{pdf?.pdf_title}</marquee> </h4>
                      <svg
                        style={{color: "#A3A3A3"}}
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        height="16"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path>
                      </svg>
                    </div>
                  </div>
                )
                }
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
