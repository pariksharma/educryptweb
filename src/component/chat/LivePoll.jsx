import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import LivePollOptions from "./LivePollOptions";

const LivePoll = ({chat_node, combinedPollData, renderCountdown, handleSubmitAnswer, database, getFireBaseKey}) => {

  // console.log('chat_node', chat_node)

    // console.log('combined', combinedPollData)
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
