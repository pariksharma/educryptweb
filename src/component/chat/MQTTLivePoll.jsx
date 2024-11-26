import React, { useEffect, useState } from 'react'
import { format } from "date-fns";

const MQTTLivePoll = ({listenURL, port, settingNode, chatNode, course_id, isPublic, locked_room, pollData}) => {

    const [combinedPollData, setCombinedPollDatas] = useState([])
    

    useEffect(() => {
        setCombinedPollDatas(pollData)
    }, [pollData])

    


    



  return (
    <div class="holder  justify-content-center">
        {combinedPollData?.length > 0 && combinedPollData.map((poll) => (
            <div class="card" style={{width: "100%"}}>
                <div class="d-flex justify-content-between align-items-center card-header bg-white">
                    <div class="m-0">
                    <h5 class="m-0 l_title">{poll?.question}</h5>
                    {/* <p class="m-0 j_title">{formatTime(poll?.created)}</p> */}
                    </div>
                    <div class="hl_timer">
                    <p class="m-0 d-flex l_timer">
                        <i class="bi bi-clock-history me-1"></i>{" "}
                        <span class="history_timer m-0">00:15</span>
                    </p>
                    </div>
                    <button class="leader-btn" style={{display:"none"}}>
                    Leaderboard
                    </button>
                </div>
                <div class="card-body">
                    <div class="radio-1">
                    <input
                        id="radio-1"
                        class="radio-custom"
                        name="radio-group-1"
                        type="radio"
                    />
                    <label for="radio-1" class="radio-custom-label">
                        Yes
                    </label>
                    <div class="progress">
                        <div class="progress-bar-1" style={{width:"0%"}}></div>
                    </div>
                    <div style={{float:"right"}} class="progress-percent-1">
                        0%
                    </div>
                    </div>
                    <div class="radio-2">
                    <input
                        id="radio-2"
                        class="radio-custom"
                        name="radio-group-1"
                        type="radio"
                    />
                    <label for="radio-2" class="radio-custom-label">
                        No
                    </label>
                    <div class="progress">
                        <div class="progress-bar" style={{width:"0%"}}></div>
                    </div>
                    <div style={{float:"right"}} class="progress-percent">
                        10%
                    </div>
                    </div>
                </div>
            </div>
        ))}
        {/* <div class="card" style={{width: "100%"}}>
        <div class="d-flex justify-content-between align-items-center card-header bg-white">
            <div class="m-0">
            <h5 class="m-0 l_title">Anurag Joshi</h5>
            <p class="m-0 j_title">Just Now</p>
            </div>
            <div class="hl_timer">
            <p class="m-0 d-flex l_timer">
                <i class="bi bi-clock-history me-1"></i>{" "}
                <span class="history_timer m-0">00:15</span>
            </p>
            </div>
            <button class="leader-btn" style={{display:"none"}}>
            Leaderboard
            </button>
        </div>
        <div class="card-body">
            <div class="radio-1">
            <input
                id="radio-1"
                class="radio-custom"
                name="radio-group-1"
                type="radio"
            />
            <label for="radio-1" class="radio-custom-label">
                Yes
            </label>
            <div class="progress">
                <div class="progress-bar-1" style={{width:"0%"}}></div>
            </div>
            <div style={{float:"right"}} class="progress-percent-1">
                0%
            </div>
            </div>
            <div class="radio-2">
            <input
                id="radio-2"
                class="radio-custom"
                name="radio-group-1"
                type="radio"
            />
            <label for="radio-2" class="radio-custom-label">
                No
            </label>
            <div class="progress">
                <div class="progress-bar" style={{width:"0%"}}></div>
            </div>
            <div style={{float:"right"}} class="progress-percent">
                10%
            </div>
            </div>
        </div>
        </div> */}
    </div>
  )
}

export default MQTTLivePoll