import React, { useEffect, useState } from "react";
import Button1 from "../buttons/button1/button1";
import { FaShare } from "react-icons/fa";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { Router } from "react-router-dom";
import { useRouter } from "next/router";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LiveTestCard = ({
  testData,
  value,
  intervalRef,
  popupRef,
  handleCallFunction,
}) => {
  // const targetTimestamp = 1727270640;
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [BaseURL, setBaseURL] = useState("");
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const versionData = useSelector((state) => state.allCategory?.versionData);
  const router = useRouter();

  useEffect(() => {
    let domain = localStorage.getItem("domain");
    if (process.env.NEXT_PUBLIC_TEST_URL) {
      setBaseURL(process.env.NEXT_PUBLIC_TEST_URL);
    } else {
      setBaseURL(domain.split(",")[0]);
    }
  }, []);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  // console.log('BaseURL', BaseURL)

  // let domain = localStorage.getItem('domain')
  // const BaseURL = process.env.NEXT_PUBLIC_TEST_URL ? process.env.NEXT_PUBLIC_TEST_URL : domain.split(',')[0]
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Clean up the timer on component unmount
  }, [testData]);

  useEffect(() => {
    if (
      String(timeLeft.hours).padStart(2, "0") == "00" &&
      String(timeLeft.minutes).padStart(2, "0") == "00" &&
      String(timeLeft.seconds).padStart(2, "0") == "00"
    ) {
      setIsTimeUp(true);
    } else {
      setIsTimeUp(false);
    }
  }, [timeLeft]);

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

  function calculateTimeLeft() {
    const currentTime = Math.floor(Date.now() / 1000); // Get current Unix time in seconds
    const difference = testData.start_date - currentTime;

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((difference % (60 * 60)) / 60);
    const seconds = difference % 60;

    return { hours, minutes, seconds };
  }

  // console.log('Countdown:',String(timeLeft.hours).padStart(2, '0'), ':' , String(timeLeft.minutes).padStart(2, '0'), ':', String(timeLeft.seconds).padStart(2, '0'))

  const formatDate = (value) => {
    const cr_date = new Date(value * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      return format(cr_date, "d MMM yyyy | h:mm a");
    }
  };

  const handleResultTest = (val, index) => {
    var firstAttempt = "1";
    // if (val.state == "") {
    //   firstAttempt = "1";
    // }
    // // else if (App.Server_Time.ToUnixTimeSeconds() > long.Parse(Current_Selected_Resource.end_date)){
    // //   firstAttempt = "0";
    // // }
    if (ReAttemptTime(val.is_reattempt)) {
      firstAttempt = "0";
    }
    const formData = {
      jwt: localStorage.getItem("jwt"),
      user_id: localStorage.getItem("user_id"),
      course_id: val?.course_id,
      test_id: val?.id,
      lang: val?.lang_used ? val?.lang_used : 1,
      state: val?.state ? val?.state : 0,
      test_type: val?.test_type,
      first_attempt: firstAttempt,
      appid: localStorage.getItem("appId"),
    };

    // console.log("formData", formData);
    const encryptData = btoa(JSON.stringify(formData));
    // console.log("encryptData", encryptData);
    // const encryptData = encrypt(JSON.stringify(formData));
    // Router.push(`https://educryptnetlify.videocrypt.in/webstaging/web/LiveTest/learn_result_window?data=${encryptData}`)
    window.open(
      `${BaseURL}/web/LiveTest/result?inshow_result=${encryptData}`,
      "popupWindow",
      `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
    );
  };

  const handleTakeTest = (val) => {
    // if(val.is_live == 1){
    let firstAttempt = "0";
    if (val.state == "") {
      firstAttempt = "1";
    }
    // else if (App.Server_Time.ToUnixTimeSeconds() > long.Parse(Current_Selected_Resource.end_date))
    // {
    //     firstAttempt = "0";
    // }
    else if (ReAttemptTime(val.is_reattempt)) {
      firstAttempt = "0";
    }
    const formData = {
      appid: 150,
      jwt: localStorage.getItem("jwt"),
      user_id: localStorage.getItem("user_id"),
      course_id: val?.course_id,
      test_id: val?.id,
      lang: val?.lang_used ? val?.lang_used : 1,
      state: val?.state ? val?.state : 0,
      test_type: val?.test_type,
      first_attempt: firstAttempt,
      appid: localStorage.getItem("appId"),
    };

    // console.log("formData", formData);
    const encryptData = btoa(JSON.stringify(formData));
    // console.log("encryptData", encryptData);
    // console.log(
    //   "https:}",
    //   `https://educryptnetlify.videocrypt.in/webstaging/web/LiveTest/attempt_now_window?data=${encryptData}`
    // );

    // router.push(`https://educryptnetlify.videocrypt.in/webstaging/web/LiveTest/attempt_now_window?data=${encryptData}`)
    popupRef.current = window.open(
      `${BaseURL}/web/LiveTest/attempt_now_window?data=${encryptData}`,
      "popupWindow",
      `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
    );

    // Start interval to check if the popup is still open
    intervalRef.current = setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        clearInterval(intervalRef.current);
        popupRef.current = null;
        // onPopupClose(); // Call the function to handle the popup close event
        // getLayer3Data(data3, title3);
        handleCallFunction();
        // console.log('867867687687')
      }
    }, 500); // Check every 500ms
  };

  const handleRankTest = (val) => {
    const formData = {
      jwt: localStorage.getItem("jwt"),
      user_id: localStorage.getItem("user_id"),
      course_id: val?.course_id,
      test_id: val?.id,
      lang: val?.lang_used ? val?.lang_used : 1,
      state: val?.state ? val?.state : 0,
      test_type: val?.test_type,
      first_attempt: 1,
      appid: localStorage.getItem("appId"),
    };
    // console.log("formData", formData);
    const encryptData = btoa(JSON.stringify(formData));
    // console.log("encryptData", encryptData);

    window.open(
      `${BaseURL}/web/LiveTest/result_window?data=${encryptData}`,
      "popupWindow",
      `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
    );
  };

  // useEffect(() => {
  //   // Recalculate timeLeft whenever testData changes
  //   setTimeLeft(calculateTimeLeft());

  //   // Optionally reset any states or initiate actions needed
  // }, [testData]);

  // console.log('testData', testData)

  return (
    <>
       {/* <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      /> */}
      {/* {console.log("test", testData)} */}
      {/* <Toaster position="top-right" reverseOrder={false} /> */}
      <div className="d-flex justify-content-center col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3 mb-4 p-0">
        <div className="card border-0 shadow b-radius course_card m-0">
          {value == "LIVE" && (
            <p className={`m-0 course-badge ${value}`}>Live</p>
          )}
          {value == "UPCOMING" && (
            <p className={`m-0 course-badge ${value}`}>Upcoming</p>
          )}
          <div className="w-100 imgBorder d-flex align-items-center justify-content-center">
            <img
              style={{ borderRadius: "10px" }}
              src={
                testData?.image ? testData.image : "/assets/images/noImage.jfif"
              }
              className="card-img-top"
              alt="..."
            />
          </div>
          <div className="card-body pt-3 px-0 pb-0">
            <h6 className="mb-0 slideTitle">{testData.test_series_name}</h6>
            <h6 className="my-2  slideText">{testData.course_name}</h6>
          </div>
          <p className="my-2 d-flex align-items-center validity">
            <img
              className="calendarDate2 me-1"
              src="/assets/images/calenderLogo2.png"
              alt=""
            />
            Start On:
            <span className="ms-2 valid_date">
              {formatDate(testData.start_date)}
            </span>
          </p>
          <p className="d-flex align-items-center validity">
            <img
              className="calendarDate2 me-1"
              src="/assets/images/clockLogo.png"
              alt=""
            />
            End On:
            <span className="ms-2 valid_date">
              {formatDate(testData.end_date)}
            </span>
          </p>
          <hr className="dotted-divider" />
          <div className="myCourseBtn d-flex flex-wrap flex-lg-nowrap gap-2">
            {value == "LIVE" &&
              (testData?.state == "" || testData?.state == 0) && (
                <Button1
                  value="Attempt Now"
                  handleClick={() => handleTakeTest(testData)}
                  data={true}
                />
              )}
              {value == "LIVE" &&
              !ReAttemptTime(testData?.is_reattempt) &&
              testData?.state == 1 && (
                <>
                  {/* <Button1
                    value="Re-Attempt"
                    handleClick={() => handleTakeTest(testData)}
                    data={true}
                  /> */}
                  <Button1
                    value={testData?.state == 1 ? `View Result` : `Leaderboard`}
                    handleClick={() =>
                      testData?.state
                        ? handleResultTest(testData)
                        : handleRankTest(testData)
                    }
                    data={true}
                  />
                </>
              )}
            {value == "LIVE" &&
              ReAttemptTime(testData?.is_reattempt) &&
              testData?.state == 1 && (
                <>
                  <Button1
                    value="Re-Attempt"
                    handleClick={() => handleTakeTest(testData)}
                    data={true}
                  />
                  <Button1
                    value={testData?.state == 1 ? `View Result` : `Leaderboard`}
                    handleClick={() =>
                      testData?.state
                        ? handleResultTest(testData)
                        : handleRankTest(testData)
                    }
                    data={true}
                  />
                </>
              )}
            {value == "UPCOMING" && (
              <Button1
                value={
                  isTimeUp
                    ? `Start Test`
                    : `Started In- ${String(timeLeft.hours).padStart(
                        2,
                        "0"
                      )}:${String(timeLeft.minutes).padStart(2, "0")}:${String(
                        timeLeft.seconds
                      ).padStart(2, "0")}`
                }
                handleClick={() => isTimeUp && handleTakeTest(testData)}
                data={true}
              />
            )}
            {value == "COMPLETED" && (
              <Button1
                value={testData?.state == 1 ? `View Result` : `Leaderboard`}
                handleClick={() =>
                  testData?.state
                    ? handleResultTest(testData)
                    : handleRankTest(testData)
                }
                data={true}
              />
            )}
            {/* {versionData?.share_content == 1 && (
              <button className="px-1 btn_detailShare">
                <FaShare />
              </button>
            )} */}
            {/* <Button2 value="Extend Validity" handleClick={handleExplore} /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveTestCard;
