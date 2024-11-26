import React, { useEffect, useState } from 'react'
import { format } from "date-fns";
import { TiInputChecked } from "react-icons/ti";
import { get, onValue, ref } from 'firebase/database';

const LivePollOptions = ({poll, renderCountdown, index, handleSubmitAnswer, database, chat_node, getFireBaseKey}) => {

    const [selectedOptions, setSelectedOptions] = useState({})
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [selectAnswer, setSelectAnswer] = useState(false)
    const [myAnswer, setMyAnswer] = useState('')

    useEffect(() => {
      const fetchAlreadySubmit = async () => {
        const result = await alreadySubmit();
        setAlreadySubmitted(result); // Update the state with the result
      };
  
      fetchAlreadySubmit();
    }, [poll]);

    const formatTime = (date) => {
        // console.log('data', date);
          const cr_date = new Date(date);
          if (cr_date) {
            return format(cr_date, "h:mm a");
          }
        };

        const handleOptionChange = (pollId, option) => {
            // console.log('pollId, option', pollId, option)
            let selectedAnswer = "";
            if(option == "option_1") {
                selectedAnswer = '1'
            }
            else if(option == "option_2") {
                selectedAnswer = '2'
            }
            else if(option == "option_3") {
                selectedAnswer = '3'
            }
            else if(option == "option_4") {
                selectedAnswer = '4'
            }
            setSelectAnswer(true)
            handleSubmitAnswer(poll, selectedAnswer)

            setSelectedOptions((prev) => ({
              ...prev,
              [pollId]: option, // Update the selected option for the specific poll
            }));
          };

          const alreadySubmit = async () => {
            try {
              const appId = localStorage.getItem("appId"); 
              const userId = localStorage.getItem("user_id"); 
              const userName = localStorage.getItem("userName");
              const firebaseId = getFireBaseKey(poll.id)
              // console.log('firebaseId', firebaseId)
              const alreadySubmitRef = ref(
                database,
                `${appId}/chat_master/${chat_node}/Poll/${firebaseId}/users/${userId}`
              );
              const snapshot = await get(alreadySubmitRef); // 
              const alreadySubmitValue = snapshot.val();
                // console.log('alreadySubmitValue', alreadySubmitValue)
              setMyAnswer(alreadySubmitValue)
              return !!alreadySubmitValue;
            } catch (error) {
              console.log('error found', error)
            }
          }


  return (
    <div className="card mb-2" style={{width: "100%"}} key={index}>
      <div className="d-flex justify-content-between align-items-center card-header bg-white">
        <div className="m-0">
          <h5 className="m-0 l_title">{poll?.question}</h5>
          <p className="m-0 j_title">{poll?.date && formatTime(poll?.date)}</p>
        </div>
        <div className="hl_timer">
          <p className="m-0 d-flex l_timer">
            <i className="bi bi-clock-history me-1"></i>{" "}
            <span className="history_timer m-0">{renderCountdown(poll?.valid_till)}</span>
          </p>
        </div>
        <button className="leader-btn" style={{display:"none"}}>
          Leaderboard
        </button>
      </div>
      <div className='card-body'>
        {['option_1', 'option_2', 'option_3', 'option_4'].map((optionKey, idx) => {
            const optionValue = poll[optionKey];
            if (!optionValue) return null; // Skip empty options

            const attemptKey = `attempt_${idx + 1}`;
            const attemptValue = poll[attemptKey] ? parseInt(poll[attemptKey], 10) : 0;

            // Calculate the total attempts from all attempt keys
            const totalAttempts = ['attempt_1', 'attempt_2', 'attempt_3', 'attempt_4']
            .reduce((acc, key) => acc + (parseInt(poll[key], 10) || 0), 0);

            // Calculate percentage for the current attempt
            const percentage = totalAttempts > 0 ? ((attemptValue / totalAttempts) * 100).toFixed(2) : 0;
            // {console.log('alreadySubmitted', alreadySubmitted, poll.id)}
            return (
                <div className={`radio-1`} key={idx}>
                    {myAnswer?.answer != idx+1 ? 
                        ((selectedOptions[poll?.id] != optionKey) ?
                            <input
                                id={`radio-${poll?.id}-${idx + 1}`}
                                className="radio-custom"
                                name={`radio-group-${poll?.id}`}
                                type="radio"
                                value={optionKey}
                                checked={selectedOptions[poll?.id] === optionKey} // Mark as checked if selected
                                onChange={() => (renderCountdown(poll?.valid_till) != "Expired" && !alreadySubmitted) && handleOptionChange(poll?.id, optionKey)} // Handle selection
                            />
                        :
                            <TiInputChecked />
                        ) 
                    :
                      <TiInputChecked />
                    }
                    <label htmlFor={`radio-${poll?.id}-${idx + 1}`} className="radio-custom-label">
                        {optionValue}
                    </label>
                    <div className="progress">
                        <div 
                          className={((alreadySubmitted || selectAnswer) && (parseInt(poll?.answer) == idx+1)) ? `progress-bar-1` : ``} 
                          style={{ width: `${(alreadySubmitted || selectAnswer) && percentage}%` }}></div>
                    </div>
                    <div style={{ float: "right" }} className={`progress-percent-1`}>
                        {(alreadySubmitted || selectAnswer) && `${percentage}%`}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  )
}

export default LivePollOptions