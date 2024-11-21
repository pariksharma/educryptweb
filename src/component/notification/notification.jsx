import React, { useEffect, useState } from "react";
import { getMasterDataService, getNotificationService, markReadNotification } from "@/services";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/router";
import { format } from "date-fns";
import ErrorPage from "../errorPage";
import LoaderAfterLogin from "../loaderAfterLogin";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import Link from "next/link";
import Head from 'next/head';

const Notification = () => {
  const [notificationData, setNotificationData] = useState([]);
  const [showError, setShowError] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const [id, setId] = useState(-1)
  const [appLogo, setAppLogo] = useState('')
  const [BaseURL, setBaseURL] = useState("");
  const router = useRouter();
  const token = get_token();

  useEffect(() => {
    setShowError(false)
    fetchNotification();
    setAppLogo(localStorage.getItem('logo'))
  }, []);

  useEffect(() => {
    let domain = localStorage.getItem("domain");
    if (process.env.NEXT_PUBLIC_TEST_URL) {
      setBaseURL(process.env.NEXT_PUBLIC_TEST_URL);
    } else {
      setBaseURL(domain.split(",")[0]);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
    }
    // Cleanup event listener on component unmount
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const compareTime = (startTime, endTime) => {
    const givenStartTime = new Date(startTime * 1000);
    const givenEndTime = new Date(endTime * 1000);

    // console.log("time", givenStartTime, givenEndTime)

    const currentTime = new Date();
    if (currentTime < givenStartTime) {
      return "pending"
    } else if (currentTime > givenStartTime && currentTime < givenEndTime) {
      return "attempt"
    }
    else if (currentTime > givenEndTime) {
      return "result"
    }
  }

  const compareWithCurrentTime = (time) => {
    const givenTime = new Date(time * 1000);
    const currentTime = new Date();
    if (currentTime < givenTime) {
      return true
    }
    else {
      return false
    }
  }

  const toggleReadMore = (notify_id, notification) => {
    if (id != notify_id) {
      setId(notify_id)
    }
    else {
      setId(-1)
    }
    setIsExpanded(!isExpanded);
    if (notification?.view_state == 0) {
      markAsRead(notification?.id)
    }
  };
  const markAsRead = async (notification_id) => {
    // console.log("mark")
    try {
      const formData = {
        id: notification_id
      }
      const response_ReadNotification_serice = await markReadNotification(encrypt(JSON.stringify(formData), token))
      const response_ReadNotification_data = decrypt(response_ReadNotification_serice.data, token)
      // console.log('response_ReadNotification_data', response_ReadNotification_data)
      if (response_ReadNotification_data?.status) {
        fetchNotification();
      }
    } catch (error) {
      // console.log("error found: ", error)
      router.push('/')
    }
  }

  const fetchNotification = async () => {
    try {
      const formData = {
        page: 1,
      };
      const response_getNotification_service = await getNotificationService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getNotification_data = decrypt(
        response_getNotification_service.data,
        token
      );
      console.log("response_getNotification_data", response_getNotification_data);
      if (response_getNotification_data?.status) {
        if (response_getNotification_data?.data?.length < 0) {
          setShowError(true)
        }
        else setNotificationData(response_getNotification_data?.data);
      } else {
        setShowError(true)
        if (response_getNotification_data.message == msg) {
          toast.error(response_getNotification_data.message);
          setTimeout(() => {
            localStorage.removeItem("jwt");
            localStorage.removeItem("user_id");
            if (router.pathname.startsWith("/private")) {
              router.push("/");
            } else location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.log("error found: ", error)
      router.push('/')
    }
  };

  const formatDate = (value) => {
    const cr_date = new Date(value * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      return format(cr_date, "d MMMM, yyyy | h:mm a");
    }
  };

  const handleNotify = async (data, index) => {
    if (data.action_element == 2) {
      const parent_id = data?.extra?.parent_id ? data?.extra?.parent_id : ''
      const course_id = data?.extra?.course_ids;
      router.push(
        `/private/myProfile/detail/${'course' + ":" + course_id + "&" + "" + "parent:" + parent_id
        }`
      );
      if (data?.view_state == 0) {
        markAsRead(data?.id)
      }
    }
    else if (data.action_element == 1) {
      if (data?.view_state == 0) {
        markAsRead(data?.id)
      }
    }
    else if (data?.action_element == 4) {
      // console.log('hhjhjkhk', data)
      const videoDetail = await getDetail(data?.extra);
      console.log('videDetail', videoDetail)
      if (data?.extra?.tile_type == "video") {
        if (!compareWithCurrentTime(videoDetail?.list[0]?.start_date)) {
          handleWatch(videoDetail?.list[0])
          if (data?.view_state == 0) {
            // console.log('ghfjjfhgkjhjytjbgu')
            markAsRead(data?.id)
          }
        } else {
          toast.error("Class is not started yet", {
            // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
            autoClose: 1500,
          });
          if (data?.view_state == 0) {
            // console.log('ghfjjfhgkjhjytjbgu')
            markAsRead(data?.id)
          }
        }
        // if(data?.view_state == 0) {
        //   // console.log('ghfjjfhgkjhjytjbgu')
        //   markAsRead(data?.id)
        // }
      }
      else if (data?.extra?.tile_type == "test") {
        // if(compareWithCurrentTime(videoDetail?.list[0]?.start_date)) {
        //   toast.error("Test is not started yet", {
        //     // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
        //     autoClose: 1500,
        //   });
        // }
        if (compareTime(videoDetail?.list[0]?.start_date, videoDetail?.list[0]?.end_date) == "pending") {
          // console.log("pending")
          toast.error("Test is not started yet", {
            // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
            autoClose: 1500,
          });
          if (data?.view_state == 0) {
            markAsRead(data?.id)
          }
        }
        else if (compareTime(videoDetail?.list[0]?.start_date, videoDetail?.list[0]?.end_date) == "attempt") {
          // console.log("attempt", data)
          if (videoDetail?.list[0]?.state == "" || videoDetail?.list[0]?.state == 0) {
            handleTakeTest(videoDetail?.list[0], data?.extra)
            if (data?.view_state == 0) {
              markAsRead(data?.id)
            }
          }
          else if (videoDetail?.list[0]?.state == 1 && !compareWithCurrentTime(videoDetail?.list[0]?.is_reattempt)) {
            handleResultTest(videoDetail?.list[0], data?.extra)
            if (data?.view_state == 0) {
              markAsRead(data?.id)
            }
          }
          else if (videoDetail?.list[0]?.state == 1 && compareWithCurrentTime(videoDetail?.list[0]?.is_reattempt)) {
            handleTakeTest(videoDetail?.list[0], data?.extra)
            if (data?.view_state == 0) {
              markAsRead(data?.id)
            }
          }
        }
        else if (compareTime(videoDetail?.list[0]?.start_date, videoDetail?.list[0]?.end_date) == "result") {
          if (!compareWithCurrentTime(videoDetail?.list[0]?.is_reattempt) && videoDetail?.list[0]?.state == 1) {
            // console.log("result")
            handleResultTest(videoDetail?.list[0], data?.extra)
            if (data?.view_state == 0) {
              markAsRead(data?.id)
            }
          }
          else if (!compareWithCurrentTime(videoDetail?.list[0]?.is_reattempt) && videoDetail?.list[0]?.state != 1) {
            // console.log("leadership")
            handleRankTest(videoDetail?.list[0], data?.extra)
            if (data?.view_state == 0) {
              markAsRead(data?.id)
            }
          }
        }
      }
      else if (data?.extra?.tile_type == "image") {
        window.open(videoDetail?.list[0]?.file_url, '_blank')
        if (data?.view_state == 0) {
          markAsRead(data?.id)
        }
      }
      else if (data?.extra?.tile_type == "pdf") {
        if (videoDetail?.list[0]?.file_url.includes('.pdf')) {
          window.open(videoDetail?.list[0]?.file_url, '_blank')
          if (data?.view_state == 0) {
            markAsRead(data?.id)
          }
        }
      }
      else if (data?.extra?.tile_type == "link") {
        window.open(videoDetail?.list[0]?.file_url, '_blank')
        if (data?.view_state == 0) {
          markAsRead(data?.id)
        }
      }
    }
    // else if(data?.action_element == 4)
  }

  const handleTakeTest = (val, course_data) => {
    // console.log("val111111111", val);
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      var firstAttempt = "0";
      if (val.state == "") {
        firstAttempt = "1";
      }
      const formData = {
        jwt: localStorage.getItem("jwt"),
        user_id: localStorage.getItem("user_id"),
        course_id: course_data?.course_id,
        test_id: course_data?.file_id,
        lang: val?.lang_used ? val?.lang_used : 1,
        state: val?.state ? val?.state : 0,
        test_type: val?.test_type,
        first_attempt: firstAttempt,
        appid: localStorage.getItem("appId"),
      };

      // console.log("formData", formData);
      const encryptData = btoa(JSON.stringify(formData));
      if (typeof window !== 'undefined') {
        window.open(
          `${BaseURL}/web/LiveTest/attempt_now_window?data=${encryptData}`,
          "popupWindow",
          `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
        );
      }
      // Start interval to check if the popup is still open
    }
  };

  const handleResultTest = (val, course_data) => {
    var firstAttempt = "1";
    // if (val.state == "") {
    //   firstAttempt = "1";
    // }
    // // else if (App.Server_Time.ToUnixTimeSeconds() > long.Parse(Current_Selected_Resource.end_date)){
    // //   firstAttempt = "0";
    // // }
    if (compareWithCurrentTime(val.is_reattempt)) {
      firstAttempt = "0";
    }
    const formData = {
      jwt: localStorage.getItem("jwt"),
      user_id: localStorage.getItem("user_id"),
      course_id: course_data?.course_id,
      test_id: course_data?.file_id,
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
    if (typeof window !== 'undefined') {
      window.open(
        `${BaseURL}/web/LiveTest/result?inshow_result=${encryptData}`,
        "popupWindow",
        `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
      );
    }
  };

  const handleRankTest = (val, course_data) => {
    const formData = {
      jwt: localStorage.getItem("jwt"),
      user_id: localStorage.getItem("user_id"),
      course_id: course_data?.course_id,
      test_id: course_data?.file_id,
      lang: val?.lang_used ? val?.lang_used : 1,
      state: val?.state ? val?.state : 0,
      test_type: val?.test_type,
      first_attempt: 1,
      appid: localStorage.getItem("appId"),
    };
    // console.log("formData", formData);
    const encryptData = btoa(JSON.stringify(formData));
    // console.log("encryptData", encryptData);
    if (typeof window !== 'undefined') {
      window.open(
        `${BaseURL}/web/LiveTest/result_window?data=${encryptData}`,
        "popupWindow",
        `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
      );
    }
  };

  const getDetail = async (data) => {
    const formData = {
      course_id: data?.course_id,
      tile_id: data?.tile_id,
      type: data?.tile_type,
      revert_api: '0#3#0#0',
      file_id: data?.file_id,
      topic_id: '',
      subject_id: '',
      layer: '3',
      page: 1,
    };
    const response_getMasterData_service = await getMasterDataService(
      encrypt(JSON.stringify(formData), token)
    );
    const response_getMasterData_Data = decrypt(
      response_getMasterData_service.data,
      token
    );
    // console.log(
    //   "response_getMasterData_Data",
    //   response_getMasterData_Data.data
    // );
    if (response_getMasterData_Data.status) {
      return response_getMasterData_Data.data;
    }
  };

  const handleWatch = (data) => {
    // console.log('data', data)
    if (data?.live_status == 2 && data?.video_type == 8) {
      showErrorToast('Live class has been ended')
    }
    else {
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
      }
      // router.push(`/private/myProfile/view-pdf/${encodeURIComponent(value.file_url)}`)
      router.push({
        pathname: `/private/myProfile/play/${data.id}`,
        query: playData,
      });
      // router.push(`/private/myProfile/play/${data.file_url}&type=${data.file_type}`)
      // console.log('watch')
    }
  }

  return (
    <>
      <Head>
        <title>{'Notification'}</title>
        <meta name={'Notification'} content={'Notification'} />
      </Head>

      <ToastContainer
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
      />

      {/* <Toaster position="top-right" reverseOrder={false} /> */}

      {/* <div>Notification</div> */}
      <section className="container-fluid mt-3">
        <div className="row">
          <div className="col-md-12">
            {notificationData?.length > 0 ? (
              notificationData?.map((item, index) => {
                return (
                  <div
                    className={`card p-2 mx-auto NotifyCard ${item?.view_state == 0 ? "active" : ""} mb-2`}
                    style={(item?.action_element == 4 || item?.action_element == 2) ? { cursor: "pointer" } : {}}
                    key={index}
                    onClick={() => handleNotify(item, index)}
                  >
                    <div className="d-flex gap-2 ">
                      <div className="m-0 position-relative">
                        <p className={`m-0 ${item?.view_state == 0 ? "activeNotification" : ""}`}></p>
                        <img
                          className="notifyImg"
                          src={appLogo ? appLogo : "/assets/images/notifyImg.svg"}
                          alt=""
                        />
                      </div>
                      <div className="pt-1">
                        {/* {console.log('length', item?.title, item?.action_element  )} */}
                        <h5 className="m-0 notifyTitle">{item.title}</h5>
                        {(item?.message?.length < 200 && (item?.action_element != 5 || item?.action_element != 6)) ?
                          (item?.action_element != 5 && item?.action_element != 6) ?
                            <p
                              className="m-0 notify_Text"
                              dangerouslySetInnerHTML={{ __html: item.message }}
                            ></p>
                            :
                            <p className="m-0 notify_Text">
                              {(id == index) ? (<>
                                <span dangerouslySetInnerHTML={{ __html: item?.message }}></span>
                                {item?.action_element == 5 && <div style={{ width: '40%' }}><img className="img-fluid" src={item?.extra?.image} alt="" /></div>}
                                {/* <img src="https://images.unsplash.com/photo-1576158113928-4c240eaaf360?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" /> */}
                                {(item?.action_element == 6 && item?.extra?.link_type == "") && <a href={item?.extra?.url} target="_blank">click here</a>}
                                {(item?.action_element == 6 && item?.extra?.link_type == "out-app") && <a href={item?.extra?.url} target="_blank">click here</a>}
                                {(item?.action_element == 6 && item?.extra?.link_type == "in-app") && <Link href={item?.extra?.url} >click here</Link>}
                              </>
                              ) : (
                                <span dangerouslySetInnerHTML={{ __html: item?.message.slice(0, 200) }}></span>
                              )}
                              &nbsp;<a href="javascript:void(0)"
                                className="m-0"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent handleNotify from being triggered
                                  toggleReadMore(index, item);
                                }}
                                style={{ color: 'blue', cursor: 'pointer', marginLeft: '5px', fontWeight: '400' }}
                              >
                                {(id == index) ? 'Read Less' : 'Read More'}
                              </a>
                            </p>
                          :
                          <p className="m-0 notify_Text">
                            {isExpanded && (id == index) ? (<>
                              <span dangerouslySetInnerHTML={{ __html: item?.message }}></span>
                              {item?.action_element == 5 && <div style={{ width: '40%' }}><img className="img-fluid" src={item?.extra?.image} alt="" /></div>}
                              {/* <img src="https://images.unsplash.com/photo-1576158113928-4c240eaaf360?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" /> */}
                              {(item?.action_element == 6 && item?.extra?.link_type == "out-app") && <a href={item?.extra?.url} target="_blank">click here</a>}
                              {(item?.action_element == 6 && item?.extra?.link_type == "in-app") && <Link href={item?.extra?.url} >click here</Link>}
                            </>
                            ) : (
                              <span dangerouslySetInnerHTML={{ __html: item?.message.slice(0, 200) }}></span>
                            )}
                            <span
                              className="m-0"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent handleNotify from being triggered
                                toggleReadMore(index, item);
                              }}
                              style={{ color: 'blue', cursor: 'pointer', marginLeft: '5px' }}
                            >
                              {isExpanded && (id == index) ? 'Read Less' : 'Read More'}
                            </span>
                          </p>
                        }
                        <p className="m-0 notifyDate">
                          <i className="bi bi-clock"></i>{" "}
                          {formatDate(item.created)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : <>
              {showError ?
                <ErrorPageAfterLogin />
                :
                <LoaderAfterLogin />}
            </>}
          </div>
        </div>
      </section>
    </>
  );
};

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default Notification;
