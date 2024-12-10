import React, { useEffect, useState } from 'react'
import { format } from "date-fns";
import MQTTLivePollOptions from './MQTTLivePollOptions';

const MQTTLivePoll = ({listenURL, port, settingNode, chatNode, course_id, isPublic, locked_room, pollData}) => {

    const [combinedPollData, setCombinedPollDatas] = useState([])
    

    useEffect(() => {
        setCombinedPollDatas(pollData.reverse())
    }, [pollData])

  return (
    <div className="holder">
      {combinedPollData?.length > 0 &&
        combinedPollData.map((poll, index) => (
          <MQTTLivePollOptions
            key={poll?.firebase_id}
            poll={poll}
            // renderCountdown={renderCountdown}
            index={index}
            // handleSubmitAnswer = {handleSubmitAnswer}
            // database = {database}
            // chat_node = {chat_node}
            // getFireBaseKey = {getFireBaseKey}
          />
        ))}
    </div>
  )
}

export default MQTTLivePoll