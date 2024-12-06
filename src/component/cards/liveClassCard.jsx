import React, { useEffect, useState } from "react";
import Button2 from "../buttons/button2/button2";
import Button1 from "../buttons/button1/button1";
import { FaShare } from "react-icons/fa";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LiveClassCard = ({ courseData, value }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isTimeUp, setIsTimeUp] = useState(false);

  const router = useRouter();
  const versionData = useSelector((state) => state.allCategory?.versionData);
  // console.log('course', courseData)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Clean up the timer on component unmount
  }, []);

  useEffect(() => {
    if (
      String(timeLeft.hours).padStart(2, "0") == "00" &&
      String(timeLeft.minutes).padStart(2, "0") == "00" &&
      String(timeLeft.seconds).padStart(2, "0") == "00"
    ) {
      setIsTimeUp(true);
      // console.log('hh', String(timeLeft.seconds).padStart(2, '0'))
    } else {
      setIsTimeUp(false);
    }
  }, [timeLeft]);

  function calculateTimeLeft() {
    const currentTime = Math.floor(Date.now() / 1000); // Get current Unix time in seconds
    const difference = courseData.start_date - currentTime;
    // const difference = (1727417100) - currentTime

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(difference / (60 * 60));
    const minutes = Math.floor((difference % (60 * 60)) / 60);
    const seconds = difference % 60;

    return { hours, minutes, seconds };
  }

  const formatDate = (value) => {
    const cr_date = new Date(value * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      return format(cr_date, "d MMM yyyy | h:mm a");
    }
  };

  const handleWatch = (data) => {
    // console.log("data", data);
    if (data?.live_status == 2 && data?.video_type == 8) {
      showErrorToast("Live class has been ended");
    } else {
      let playData = {
        vdc_id: data.vdc_id,
        file_url: data.file_url,
        title: data.title,
        video_type: data.video_type,
        start_date: data.start_date,
        end_date: data.end_date,
        chat_node: data.chat_node,
        course_id: data.payload.course_id,
        video_id: data.id
      };
      // let playData = {
      //   vdc_id:data.vdc_id,
      //   file_url:data.file_url,
      //   title:data.title,
      //   video_type:data.video_type
      // }
      const isLoggedIn = localStorage.getItem("jwt");
      if (!isLoggedIn) {
        setModalShow(true);
      } else {
        router.push({
          pathname: `/private/myProfile/play/${data.id}`,
          query: playData,
        });
        // if(courseData?.is_live == 1) {
        // router.push(`/private/myProfile/view-pdf/${encodeURIComponent(value.file_url)}`)
        // router.push({
        //   pathname: `/private/myProfile/play/${courseData.id}`,
        //   query: courseData,
        // });
        // router.push(`/private/myProfile/play/${data.file_url}&type=${data.file_type}`)
        // console.log('watch')
        // }
        // toast.error('Live class is not started yet')
      }
    }
  };

  const remianingTime = (startTime, endTime) => {
    // Convert Unix time to milliseconds
    const startMillis = startTime * 1000;
    const endMillis = endTime * 1000;

    // Calculate the absolute time difference in milliseconds
    const timeDiffMillis = Math.abs(endMillis - startMillis);

    // Convert milliseconds to minutes
    const timeDiffMinutes = Math.floor(timeDiffMillis / 60000);

    // Check if the difference is greater than 60 minutes
    if (timeDiffMinutes > 60) {
      // Calculate hours and remaining minutes
      const hours = Math.floor(timeDiffMinutes / 60);
      const minutes = timeDiffMinutes % 60;
      // Set the formatted output
      return `${hours} hr and ${minutes} min`;
    } else {
      // If less than or equal to 60 minutes, just show minutes
      return `${timeDiffMinutes} min`;
    }
  };

  // console.log('vvvvvvvvvv', courseData)

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
                courseData?.thumbnail_url
                  ? courseData.thumbnail_url
                  : "/assets/images/noImage.jfif"
              }
              className="card-img-top"
              alt="..."
            />
          </div>
          <div className="card-body pt-3 px-0 pb-0">
            <h6 className="mb-0 slideTitle">{courseData.title}</h6>
            <h6 className="mb-2 slideName py-2">{courseData.course_name}</h6>
          </div>
          <p className="my-2 d-flex align-items-center validity">
            <img
              className="calendarDate2 me-1"
              src="/assets/images/calenderLogo2.png"
              alt=""
            />
            {value == "COMPLETED" ? "Was Live at" : "Start On"}:
            <span className="ms-2 valid_date">
              {formatDate(courseData.start_date)}
            </span>
          </p>
          {/* {value !== 'LIVE' && <p className="d-flex align-items-center validity">
            <img
                className="calendarDate2 me-1"
                src="/assets/images/clockLogo.png"
                alt=""
            />
            End On:
            <span className="ms-2 valid_date">{formatDate(courseData.end_date)}</span>
        </p>
        } */}
          {value == "LIVE" && (
            <p className="d-flex align-items-center validity">
              <img
                className="calendarDate2 me-1"
                src="/assets/images/clockLogo.png"
                alt=""
              />
              Class Duration:
              <span className="ms-2 valid_date">
                {remianingTime(courseData.start_date, courseData.end_date)}
              </span>
            </p>
          )}
          <hr className="dotted-divider" />
          <div className="myCourseBtn d-flex flex-wrap flex-lg-nowrap gap-2">
            {/* {console.log('courseData', courseData)} */}
            {(value == "LIVE" || value == "COMPLETED") && (
              <Button1
                value="Watch"
                handleClick={() => handleWatch(courseData)}
                data={true}
              />
            )}
            {value == "UPCOMING" && (
              <Button1
                value={
                  isTimeUp
                    ? `Watch`
                    : `Started In- ${String(timeLeft.hours).padStart(
                        2,
                        "0"
                      )}:${String(timeLeft.minutes).padStart(2, "0")}:${String(
                        timeLeft.seconds
                      ).padStart(2, "0")}`
                }
                handleClick={() => isTimeUp && handleWatch()}
                data={true}
              />
            )}
            {/* {versionData?.share_content == 1 && (
              <button className="btn_detailShare">
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

export default LiveClassCard;
