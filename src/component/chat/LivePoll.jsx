import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import LivePollOptions from "./LivePollOptions";

const LivePoll = ({
  listenURL,
  port,
  settingNode,
  chat_node,
  course_id,
  isPublic,
  locked_room,
  pollData,
}) => {
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

  const [combinedPollData, setCombinedPollData] = useState([]);
  const [timers, setTimers] = useState({});
  const [userId, setUserId] = useState("");
  const [timeLeft, setTimeLeft] = useState('');
  const [pollFirebaseIds, setPollFirebaseIds] = useState('');

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
    getPollData();
  }, []);

  const getPollData = () => {
    try {
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
            console.log('pollValue', Pollvalue)
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
      console.log('answer', myAnswer)
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
      // console.log('fireBaseKey', firbaseId)

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
  
        console.log(`${updateField} updated successfully to ${newValue}`);
      }
    } catch (error) {
      console.log('error found', error)
    }
  }

  const getFireBaseKey = (id) => {
    for (const firebaseKey in pollFirebaseIds) {
      if (pollFirebaseIds[firebaseKey]?.id == id) {
        // console.log('key', firebaseKey)
        return firebaseKey
      }
    }
  }

  return (
    <div className="holder">
      {combinedPollData?.length > 0 &&
        combinedPollData.map((poll, index) => (
          <LivePollOptions
            key={poll?.firebase_id}
            poll={poll}
            renderCountdown={renderCountdown}
            index={index}
            handleSubmitAnswer = {handleSubmitAnswer}
            database = {database}
            chat_node = {chat_node}
            getFireBaseKey = {getFireBaseKey}
          />
        ))}
    </div>
  );
};

export default LivePoll;
