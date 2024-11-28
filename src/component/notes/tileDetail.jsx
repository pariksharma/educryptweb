import React, { useEffect, useState } from 'react'
import Button1 from '../buttons/button1/button1'
import { userLoggedIn } from '@/utils/helpers'
import { toast } from 'react-toastify'

const TileDetail = ({item, layer1Data, handleRead, handleWatch, handleTakeTest, handleResultTest, handleRankTest, handleUpcomingTest, i, onlineCourseAry}) => {

    const [timeValue, setTimeValue] = useState('')
    const [isLogin, setIsLogin] = useState('')
    const [purchased, setPurchased] = useState('')

    let startTime = item.start_date
    let endTime = item.end_date

    const compareTime = (startTime, endTime) => {
        const givenStartTime = new Date(startTime * 1000);
        const givenEndTime = new Date(endTime * 1000);
          const currentTime = new Date();
          if (currentTime < givenStartTime) {
            setTimeValue("pending")
          } else if(currentTime > givenStartTime && currentTime < givenEndTime) {
            setTimeValue("attempt")
          }
           else if(currentTime > givenEndTime) {
            setTimeValue("result")
           }
      }

      const ReAttemptTime = (time) => {
        const givenTime = new Date(time * 1000);
        const currentTime = new Date();
        if(currentTime < givenTime){
            return true
        }
        else {
            return false
        }
    }

      useEffect(() => {
        // Immediately call compareTime
        compareTime(startTime   , endTime );
        setIsLogin(userLoggedIn())
        
        // Set up an interval to call compareTime every 5 seconds (5000 ms)
        const intervalId = setInterval(() => {
            compareTime(startTime   , endTime )
        }, 5000);
    
        // Cleanup the interval when component unmounts
        return () => clearInterval(intervalId);
      }, [startTime , endTime ]);

      useEffect(() => {
        if(onlineCourseAry?.hasOwnProperty("is_purchased")) {
            setPurchased(onlineCourseAry?.is_purchased)
        }
        else if(onlineCourseAry?.hasOwnProperty("is_test_purchased")) {
            setPurchased(onlineCourseAry?.is_test_purchased)
        }
      }, [])

      const handleNotStarted = () => {
        toast.error('Class is not started yet')
      }

      const handleEnded = () => {
        toast.error('Live class has been ended')
      }


  return (
    <>
    <div
        className=" pg-tabs-description mt-3"
    //   onClick={() => handleOpenVideo(item)}
    >
        <div className="tabs-deschovr d-flex align-items-center rounded">
        <div className="w-100 pg-sb-topic d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center" style={{width: '97%'}}>
                <span className='videoimage'>
            <img
                src={item.thumbnail_url ? item.thumbnail_url : "/assets/images/noImage.jfif"}
                height={"60px"}
            />
            </span>
            <div className="subjectDetails">
                <p className="sub_name">{item.title}</p>
                {item.role == "PDF" && (
                <p className="m-0 sub_topics">
                    {item.release_date}
                </p>
                )}
            </div>
            </div>
            <div className="pg-sb-topic pe-2">
            <div className="btnsalltbba text-center gap-1 d-flex">
                {" "}
                {
                (isLogin ?
                (purchased != 1) ?
                    item.is_locked == 0 ?
                    <>
                        {layer1Data.type == "pdf" && <Button1 value="Read" handleClick={() => handleRead(item)} /> }
                        {(layer1Data.type == "video" || layer1Data.type == "Video") && (
                            (item.video_type == 4 || item.video_type == 8) ?
                                item.live_status == '1' ? 
                                <Button1 value="Watch Now" handleClick={() => handleWatch(item, i)} />
                                :
                                item.live_status == '0' ?
                                    <Button1 value="Watch Now" handleClick={() => handleNotStarted(item, i)} />
                                    :
                                    <Button1 value="Watch Now" handleClick={() => handleEnded(item, i)} />
                            :
                                <Button1 value="Watch Now" handleClick={() => handleWatch(item, i)} />
                        )}
                        {layer1Data?.type == "test" && 
                        (timeValue == "pending" &&
                        <Button1 value="Upcoming" 
                            handleClick={() => handleUpcomingTest(item, i)} 
                        />
                        )}
                        {layer1Data?.type == "test" && (timeValue == "attempt"  && (item?.state == "" || item?.state == 0) &&
                        <Button1 value="Attempt Now" 
                            handleClick={() => handleTakeTest(item, i)} 
                        />
                        )}

                        {layer1Data?.type == "test" && (timeValue == "result"  && (item?.state == 1) && ReAttemptTime(item?.is_reattempt) &&
                        <Button1 value="Re-Attempt" 
                            handleClick={() => handleTakeTest(item, i)} 
                        />
                        )}
                        {layer1Data?.type == "test" && (timeValue == "result" && !ReAttemptTime(item?.is_reattempt) &&
                        <Button1 value={item?.state == 1 ? "View Result" : "LeaderBoard"}
                            handleClick={() => item?.state == 1 ? handleResultTest(item, i) : handleRankTest(item, i)} 
                        />
                        )}

                        {layer1Data?.type == "test" && (timeValue == "attempt" && ReAttemptTime(item?.is_reattempt) && item?.state == 1) &&
                            <>
                                <Button1 value="Re-Attempt" 
                                    handleClick={() => handleTakeTest(item, i)} 
                                />
                                <Button1 value={item?.state == 1 ? "View Result" : "LeaderBoard"}
                                    handleClick={() => item?.state == 1 ? handleResultTest(item, i) : handleRankTest(item, i)} 
                                />  
                            </>    
                        }
                    </>
                    :
                    <>
                        {/* {console.log('hhhh')} */}
                        <img style={{ width: "32px" }} src="/assets/images/locked.png" alt="" />
                    </>
                :
                <>
                {/* {console.log('7777777777777', item)} */}
                    {layer1Data.type == "pdf" && <Button1 value="Read" handleClick={() => handleRead(item)} /> }
                        {(layer1Data.type == "video" || layer1Data.type == "Video") && (
                            (item.video_type == 4 || item.video_type == 8) ?
                                item.live_status == '1' ? 
                                <Button1 value="Watch Now" handleClick={() => handleWatch(item, i)} />
                                :
                                item.live_status == '0' ?
                                    <Button1 value="Watch Now" handleClick={() => handleNotStarted(item, i)} />
                                    :
                                    <Button1 value="Watch Now" handleClick={() => handleEnded(item, i)} />
                            :
                                <Button1 value="Watch Now" handleClick={() => handleWatch(item, i)} />
                        )}
                        {/* {(layer1Data.type == "video" || layer1Data.type == "Video") && <Button1 value="Watch Now" handleClick={() => handleWatch(item, i)} />}   */}
                        {layer1Data?.type == "test" && 
                        (timeValue == "pending" &&
                        <Button1 value="Upcoming" 
                            handleClick={() => handleUpcomingTest(item, i)} 
                        />
                        )}
                        {layer1Data?.type == "test" && (timeValue == "attempt"  && (item?.state == "" || item?.state == 0) &&
                        <Button1 value="Attempt Now" 
                            handleClick={() => handleTakeTest(item, i)} 
                        />
                        )}
                        {layer1Data?.type == "test" && (timeValue == "attempt"  && (item?.state == 1) && ReAttemptTime(item?.is_reattempt) &&
                        <Button1 value="Re-Attempt" 
                            handleClick={() => handleTakeTest(item, i)} 
                        />
                        )}
                        {layer1Data?.type == "test" && (timeValue == "attempt"  && (item?.state == 1) &&
                        <Button1 value="View Result" 
                            handleClick={() => handleResultTest(item, i)} 
                        />
                        )}
                        {layer1Data?.type == "test" && (timeValue == "result" && !ReAttemptTime(item?.is_reattempt) &&
                        <Button1 value={item?.state == 1 ? "View Result" : "LeaderBoard"}
                            handleClick={() => item?.state == 1 ? handleResultTest(item, i) : handleRankTest(item, i)} 
                        />
                        )}

                        {layer1Data?.type == "test" && (timeValue == "result"  && (item?.state == 1) && ReAttemptTime(item?.is_reattempt) &&
                        <Button1 value="Re-Attempt" 
                            handleClick={() => handleTakeTest(item, i)} 
                        />
                        )}

                        {/* {layer1Data?.type == "test" && (timeValue == "attempt" && item?.is_reattempt != 0 && item?.state == 1) &&
                            <>
                                <Button1 value="Attempt Now" 
                                    handleClick={() => handleTakeTest(item, i)} 
                                />
                                <Button1 value={item?.state == 1 ? "View Result" : "LeaderBoard"}
                                    handleClick={() => item?.state == 1 ? handleResultTest(item, i) : handleRankTest(item, i)} 
                                />  
                            </>    
                        } */}
                    </>
                    :
                    <>
                        {/* {console.log('hhhh')} */}
                        <img style={{ width: "32px" }} src="/assets/images/locked.png" alt="" />
                    </>
                )}
            </div>
            </div>
        </div>
        </div>
    </div>
    </>
  )
}

export default React.memo(TileDetail)