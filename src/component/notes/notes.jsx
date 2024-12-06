import React, { useEffect, useRef, useState } from "react";
import { getMasterDataService } from "@/services";
import { IoIosArrowForward } from "react-icons/io";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import LoginModal from "../modal/loginModal";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  all_tabName,
  reset_tab,
} from "@/store/sliceContainer/masterContentSlice";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import LoaderAfterLogin from "../loaderAfterLogin";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TileDetail from "./tileDetail";
import ErrorPage from "../errorPage";

const Notes = ({
  propsValue,
  tabName,
  resetRef,
  courseDetail,
  CourseID,
  keyValue,
  onlineCourseAry,
}) => {

  const [modalShow, setModalShow] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [tabShow, setTabShow] = useState(false);
  const [showServerError, setShowServerError] = useState(false);
  const [data3, setData3] = useState('');
  const [title3, setTitle3] = useState('');
  const [layer1Data, setLayer1Data] = useState();
  const [showLayer, setShowLayer] = useState("layer1");
  const [data3Index, setData3Index] = useState(1);
  const [layer3updateData, setLayer3updateData] = useState([]);
  const [layer2List, setLayer2List] = useState();
  const [layer1Index, setLayer1Index] = useState();
  const [layer2Index, setLayer2Index] = useState();
  const [layer3Data, setLayer3Data] = useState();
  const [breadcrumbData, setBreadcrumbData] = useState("");
  const [breadcrumbData2, setBreadcrumbData2] = useState("");
  const [BaseURL, setBaseURL] = useState("");
  const [page, setPage] = useState([]);
  const [tabLayer1index, setTabLayer1index] = useState('')
  const [tabLayer2index, setTabLayer2index] = useState('')
  const [tabLayer1Item, setTabLayer1item] = useState('')
  const [tabLayer2Item, setTabLayer2item] = useState('')
  const [conceptData, setConceptData] = useState("");
  const [conceptTitle, setConceptTitle] = useState('');
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const isApiCalled = useRef(false);

  const [checkLogin, setCheckLogin] = useState("");
  let rApi = courseDetail?.revert_api.split("#");

  useEffect(() => { }, [checkLogin]);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const router = useRouter();
  const dispatch = useDispatch();
  let displayTabData = useSelector((state) => state.allCategory?.tabName);
  const versionData = useSelector((state) => state.allCategory?.versionData);
  const popupRef = useRef(null);
  const intervalRef = useRef(null);
  useEffect(() => {
    let domain = localStorage.getItem("domain");
    if (process.env.NEXT_PUBLIC_TEST_URL) {
      setBaseURL(process.env.NEXT_PUBLIC_TEST_URL);
    } else {
      setBaseURL(domain.split(",")[0]);
    }
  }, []);

  useEffect(() => {
    const token = router.asPath;
    setCheckLogin(token.startsWith("/private/myProfile"));
  }, []);

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false);
      }, 1500);
    }
  }, [isToasterOpen]);

  useEffect(() => {
    if (courseDetail) {
      setLayer1Data(courseDetail);
    }
  }, [courseDetail]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  useEffect(() => {
    if (showLayer != 'layer2' && tabShow && layer2List && layer2List?.length > 0) {
      setShowLayer("layer3")
      setData3Index(displayTabData?.page)
      setBreadcrumbData(displayTabData?.tabLayer1Item)
      getLayer3Data(displayTabData?.tabLayer2index, displayTabData?.tabLayer2Item)
      setTabShow(false)
    }
  }, [layer2List])

  useEffect(() => {
    setData3Index(1);
    let r_api = courseDetail?.revert_api.split("#");
    if (displayTabData?.layer) {
      if (r_api[1] == 0) {
        setLayer2List(courseDetail?.meta?.list[displayTabData?.tabLayer1index]?.list);
        setTabShow(true);
      }
      else if (r_api[1] == 1) {
        setLayer2List(courseDetail?.meta?.list?.flatMap(item => item?.list))
        setTabShow(true)
      }
      else if (r_api[1] == 2) {
        getLayer3Data(displayTabData?.tabLayer1index, displayTabData?.tabLayer1Item)
        setData3Index(displayTabData?.page)
      }
      else if (r_api[1] == 3) {
        setData3(0)
        setTitle3('')
        getLayer3Data(0);
        setData3Index(displayTabData?.page)
      }
    } else {
      if (
        r_api[1] == 0
      ) {
        setShowLayer("layer1");
      } else if (
        r_api[1] == 1
      ) {
        skipLayer1Data()
      } else if (
        r_api[1] == 2
      ) {
        setShowLayer("layer1");
      } else if (
        r_api[1] == 3
      ) {
        setData3(0)
        setTitle3('')
        getLayer3Data(0);

      }
    }
  }, [keyValue]);

  useEffect(() => {
    setLayer3updateData([]);
    if (layer3Data?.list?.length > 0) {
      filterPage();
    }
  }, [layer3Data]);


  const skipLayer1Data = () => {
    setShowLayer("layer2");
    setLayer2List(courseDetail?.meta?.list?.flatMap(item => item?.list))
  }

  const getLayer2Data = (index, title) => {
    setBreadcrumbData(title);
    setLayer1Index(index);
    setShowLayer("layer2");
    setLayer2List(courseDetail?.meta?.list[index]?.list);
  };

  const getLayer3Data = async (index, title) => {
    if (title == undefined && isApiCalled.current) return;
    isApiCalled.current = true;
    setBreadcrumbData2(title);
    setShowLayer("layer3");
    setLayer2Index(index);

    const subj_id = () => {
      let r_api = courseDetail?.revert_api.split("#");
      if (
        r_api[1] == 1 ||
        r_api[1] == 3
      ) {
        return 0;
      } else {
        if (
          r_api[1] == 0
        ) {
          return courseDetail.meta?.list[0]?.id;
        } else {
          return courseDetail?.meta?.list[index]?.id;
        }
      }
    };

    const topi_id = () => {
      let r_api = courseDetail?.revert_api.split("#");
      if (
        r_api[1] == 2 ||
        r_api[1] == 3
      ) {
        return 0;
      } else {
        return layer2List[index]?.id;
      }
    };
    const data = {
      tile_id: courseDetail?.id && courseDetail?.id,
      type: courseDetail?.type && courseDetail?.type,
      revert_api: courseDetail?.revert_api && courseDetail?.revert_api,
      topic_id: topi_id(),
      subject_id: subj_id(),
      layer: 3,
      page: 1,
    };
    // const result = await getDetail(data); /// Api Call
    // setLayer3Data(result);
    try {
      const result = await getDetail(data); // API Call
      setLayer3Data(result);
    } catch (error) {
      isApiCalled.current = false;
    }
  };

  const getDetail = async (data) => {
    try {
      const token = get_token();
      const formData = {
        course_id: CourseID,
        tile_id: data.tile_id,
        type: data.type,
        revert_api: data.revert_api,
        topic_id: data.topic_id,
        subject_id: data.subject_id,
        layer: data.layer,
        page: data.page,
        parent_id: "",
      };
      const response_getMasterData_service = await getMasterDataService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getMasterData_Data = decrypt(
        response_getMasterData_service.data,
        token
      );
      // console.log('response_getMasterData_Data', response_getMasterData_Data)
      if (response_getMasterData_Data.status) {
        return response_getMasterData_Data.data;
      }
    } catch (error) {
      toast.error("Server Error");
      setShowServerError(true);
      // router.push('/')
    }
  };

  const handleRead = (value) => {
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      if (typeof window !== "undefined") {
        window.open(value.file_url, "_blank");
      }
    }
  };

  const handleWatch = (data, index) => {
    if (data?.live_status == 2 && data?.video_type == 8) {
      toast.error('Live class has been ended');
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
      const isLoggedIn = localStorage.getItem("jwt");
      if (!isLoggedIn) {
        setModalShow(true);
      } else {
        if (onlineCourseAry?.is_purchased == 1) {
          dispatch(
            all_tabName({
              index,
              tab: displayTabData?.tab ? displayTabData?.tab : keyValue,
              layer: displayTabData?.layer ? displayTabData?.layer : showLayer,
              tabLayer1index: displayTabData?.tabLayer1index ?? tabLayer1index,
              tabLayer1Item: displayTabData?.tabLayer1Item ? displayTabData?.tabLayer1Item : tabLayer1Item,
              tabLayer2index: displayTabData?.tabLayer2index ?? tabLayer2index,
              tabLayer2Item: displayTabData?.tabLayer2Item ? displayTabData?.tabLayer2Item : tabLayer2Item,
              page: data3Index,
              tabLayer3index: '',
              tabLayer3Item: ''
            })
          );
          router.push({
            pathname: `/private/myProfile/play/${data.id}`,
            query: playData,
          });
        }
        else if (onlineCourseAry?.is_purchased == 0) {
          dispatch(
            all_tabName({
              index,
              tab: displayTabData?.tab ? displayTabData?.tab : keyValue,
              layer: displayTabData?.layer ? displayTabData?.layer : showLayer,
              tabLayer1index: displayTabData?.tabLayer1index ?? tabLayer1index,
              tabLayer1Item: displayTabData?.tabLayer1Item ? displayTabData?.tabLayer1Item : tabLayer1Item,
              tabLayer2index: displayTabData?.tabLayer2index ?? tabLayer2index,
              tabLayer2Item: displayTabData?.tabLayer2Item ? displayTabData?.tabLayer2Item : tabLayer2Item,
              page: data3Index,
              tabLayer3index: '',
              tabLayer3Item: ''
            })
          );
          router.push({
            pathname: `/private/myProfile/play/${data.id}`,
            query: playData,
          });
        }

        else {
          toast.error("Please, purchase the course");
        }
      }
    }
  };

  const setLayer1 = () => {
    dispatch(reset_tab())
    let r_api = courseDetail?.revert_api.split("#");
    setData3Index(1)
    setConceptData('')
    setConceptTitle('')
    if (
      r_api[1] == 0
    ) {
      setShowLayer("layer1");
    } else if (
      r_api[1] == 1
    ) {
      setShowLayer("layer2");
    } else if (
      r_api[1] == 2
    ) {
      setShowLayer("layer2");
    }
  };

  const setLayer2 = () => {
    dispatch(
      all_tabName({
        ...all_tabName,
        tabLayer2index: '',
        tabLayer2Item: '',
        page: data3Index,
      })
    );
    let r_api = courseDetail?.revert_api.split("#");
    setData3Index(1)
    setConceptData('')
    setConceptTitle('')
    if (
      r_api[1] == 0
    ) {
      setShowLayer("layer2");
    } else if (
      r_api[1] == 1
    ) {
      setShowLayer("layer2");
    } else if (
      r_api[1] == 2
    ) {
      setShowLayer("layer1");
    }
  };
  const handleLayer1Click = (i, item) => {
    let r_api = layer1Data?.revert_api.split("#");
    setConceptData('')
    setConceptTitle('')
    if (
      r_api[1] == 2
    ) {
      setData3(i)
      setTitle3(item?.title)
      getLayer3Data(i, item.title);
      setTabLayer1index(i)
      setTabLayer1item(item.title)
    } else {
      setTabLayer1index(i)
      setTabLayer1item(item.title)
      getLayer2Data(i, item.title)
    }
  };

  const handleLayer2Click = (i, item) => {
    setConceptData('')
    setConceptTitle('')
    setData3(i)
    setTitle3(item?.title)
    getLayer3Data(i, item.title);
    setTabLayer2index(i)
    setTabLayer2item(item.title)
  };

  const filterPage = () => {
    let len = layer3Data?.list?.length;
    let length = len % 15 !== 0 ? Math.floor(len / 15) + 1 : len / 15;
    setPage(Array.from({ length }, (_, i) => i + 1));
  };

  useEffect(() => {
    if (layer3Data?.list?.length > 0 && data3Index > 0) {
      if (data3Index == 1) {
        setLayer3updateData(layer3Data?.list?.slice(0, 15));
      } else if (data3Index === page.length) {
        setLayer3updateData(
          layer3Data?.list?.slice((data3Index - 1) * 15, data3Index.length)
        );
      } else {
        setLayer3updateData(
          layer3Data?.list?.slice((data3Index - 1) * 15, data3Index * 15)
        );
      }
    }
  }, [data3Index, layer3Data]);

  const handleTakeTest = (val, index) => {
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      // if (onlineCourseAry.is_purchased == 1) {
      var firstAttempt = "0";
      if (val.state == "") {
        firstAttempt = "1";
      }
      const formData = {
        jwt: localStorage.getItem("jwt"),
        user_id: localStorage.getItem("user_id"),
        course_id: CourseID,
        test_id: val?.id,
        lang: val?.lang_used ? val?.lang_used : 1,
        state: val?.state ? val?.state : 0,
        test_type: val?.test_type,
        first_attempt: firstAttempt,
        appid: localStorage.getItem("appId"),
      };

      const encryptData = btoa(JSON.stringify(formData));
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
          getLayer3Data(data3, title3);
        }
      }, 500); // Check every 500ms
      // } else {
      //   showErrorToast("Please, purchase the course");
      // }
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleRankTest = (val) => {
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      // if (onlineCourseAry.is_purchased == 1) {
      const formData = {
        jwt: localStorage.getItem("jwt"),
        user_id: localStorage.getItem("user_id"),
        course_id: CourseID,
        test_id: val?.id,
        lang: val?.lang_used ? val?.lang_used : 1,
        state: val?.state ? val?.state : 0,
        test_type: val?.test_type,
        first_attempt: 1,
        appid: localStorage.getItem("appId"),
      };
      const encryptData = btoa(JSON.stringify(formData));
      window.open(
        `${BaseURL}/web/LiveTest/result_window?data=${encryptData}`,
        "popupWindow",
        `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
      );
    }
  };

  const handleResultTest = (val, index) => {
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      var firstAttempt = "1";
      if (Number(val.is_reattempt) > 0) {
        firstAttempt = "0";
      }
      const formData = {
        jwt: localStorage.getItem("jwt"),
        user_id: localStorage.getItem("user_id"),
        course_id: CourseID,
        test_id: val?.id,
        lang: val?.lang_used ? val?.lang_used : 1,
        state: val?.state ? val?.state : 0,
        test_type: val?.test_type,
        first_attempt: firstAttempt,
        appid: localStorage.getItem("appId"),
      };
      const encryptData = btoa(JSON.stringify(formData));
      if (typeof window !== 'undefined') {
        window.open(
          `${BaseURL}/web/LiveTest/result?inshow_result=${encryptData}`,
          "popupWindow",
          `width=${windowSize.width},height=${windowSize.height},scrollbars=yes,resizable=no`
        );
      }
    }
  };

  const handleUpcomingTest = (item, i) => {
    const isLoggedIn = localStorage.getItem("jwt");
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      // if (onlineCourseAry.is_purchased == 1) {
      const givenStartTime = new Date(item?.start_date * 1000);
      localStorage.setItem("testClicked", "true");
      setTimeout(() => {
        localStorage.removeItem("testClicked");
      }, 1000);
      const testClicked = localStorage.getItem("testClicked");
      if (testClicked) {
        toast.error(`Test will start at ${givenStartTime.toLocaleTimeString()}`);
      }
      // alert(`Test will start at ${givenStartTime.toLocaleTimeString()}`)
      // } else {
      //   showErrorToast("Please, purchase the course");
      // }
    }
  };

  const handleConcept = async (value, index) => {
    try {
      // console.log('value', value)
      setConceptTitle(value.title)
      const response = await fetch(value?.file_url);
      if (!response.ok) {
        throw new Error(`Error fetching HTML: ${response.statusText}`);
      }

      // Parse the HTML content
      const html = await response.text();

      // Set the HTML content in state
      setConceptData(html);
    } catch (error) {
      console.log('error found', error)
    }
  }

  // console.log('conceptData', conceptData)

  return (
    <>
      {courseDetail?.meta?.list?.length > 0 ? <>
      <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
      <div className="container-fluid p-4 pt-0">
        <div className={` ${checkLogin ? "row" : "row"}`}>
          <div
            className={`${checkLogin
              ? "col-lg-8 col-md-12"
              : "col-lg-7 offset--1  col-md-12"
              }`}
          >
            <section className={` ${checkLogin ? "px-2 " : ""}`}>
              <div className=" custom-breadcrumb">
                {conceptData == "" &&
                  <span
                    ref={resetRef}
                    className={
                      showLayer == "layer2" ? "active-breadcrumb" : "breadcrumb"
                    }
                    style={{ cursor: 'pointer' }}
                    onClick={setLayer1}
                  >
                    {(showLayer == "layer2" || showLayer == "layer3") &&
                      breadcrumbData ? (
                      <>
                        {breadcrumbData} <i className="bi bi-chevron-right"></i>
                      </>
                    ) : (
                      ""
                    )}
                  </span>
                }
                <span
                  className={
                    (showLayer == "layer3" && conceptData == "") ? "active-breadcrumb" : "breadcrumb"
                  }
                  style={{ cursor: 'pointer' }}
                  onClick={setLayer2}
                >
                  {showLayer == "layer3" && breadcrumbData2 ? (
                    <>
                      {breadcrumbData2} <i className="bi bi-chevron-right"></i>
                    </>
                  ) : (
                    ""
                  )}
                </span>
                <span
                  className={
                    (showLayer == "layer3" && conceptData != '') ? "active-breadcrumb" : "breadcrumb"
                  }
                  style={{ cursor: 'pointer' }}
                  // onClick={setLayer2}
                  onClick={() => {
                    setConceptData('')
                    setConceptTitle('')
                  }}
                >
                  {showLayer == "layer3" && conceptData != '' && conceptTitle ? (
                    <>
                      {conceptTitle} <i className="bi bi-chevron-right"></i>
                    </>
                  ) : (
                    ""
                  )}
                </span>
              </div>
              <div className="py-2 contentHeight ps-2">
                {showLayer == "layer3" ? (
                  layer3Data?.list?.length > 0 &&
                    layer3updateData?.length > 0 ? (
                    <div>
                      {layer3updateData?.map((item, i) => ( 
                        conceptData == "" ? (
                            <TileDetail
                              item={item}
                              layer1Data={layer1Data}
                              handleRead={handleRead}
                              handleWatch={handleWatch}
                              handleTakeTest={handleTakeTest}
                              handleResultTest={handleResultTest}
                              handleRankTest={handleRankTest}
                              handleUpcomingTest={handleUpcomingTest}
                              handleConcept = {handleConcept}
                              i={i}
                              onlineCourseAry={onlineCourseAry}
                              key={i}
                            />
                          )
                          : (
                            <div dangerouslySetInnerHTML={{__html: conceptData}}></div>
                          )
                        )
                      )}
                      {page.length > 1 && (
                        <div className="pagination_button m-2">
                          <button
                            onClick={() =>
                              data3Index > 1 && setData3Index(data3Index - 1)
                            }
                            style={data3Index == 1 ? { color: "grey" } : {}}
                          >
                            Prev
                          </button>
                          {page.map((val, index) => {
                            if (val != page?.length + 1) {
                              return (
                                <button
                                  key={index}
                                  onClick={() => setData3Index(val)}
                                  style={
                                    val == data3Index
                                      ? {
                                        backgroundColor: "#FF7426",
                                        color: "white",
                                      }
                                      : {}
                                  }
                                >
                                  {val}
                                </button>
                              );
                            }
                          })}
                          <button
                            onClick={() =>
                              data3Index < page.length &&
                              data3Index != page.length &&
                              setData3Index(data3Index + 1)
                            }
                            style={
                              data3Index == page?.length
                                ? { color: "grey" }
                                : {}
                            }
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : showError ? (
                    <ErrorPageAfterLogin />
                  ) : (
                    showServerError ? <h3>Internal Server Error</h3> : <LoaderAfterLogin />
                  )
                ) : showLayer == "layer2" ? (
                  layer2List &&
                  layer2List?.map((item, i) => {
                    return (
                      <div
                        className=" pg-tabs-description mt-3"
                        onClick={() => handleLayer2Click(i, item)}
                        key={i}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="tabs-deschovr d-flex align-items-center rounded">
                          <div
                            className="pg-sb-topic d-flex align-items-center"
                            style={{ width: "97%" }}
                          >
                            <span className="videoimage">
                              <img
                                src={
                                  item.image_icon
                                    ? item.image_icon.length
                                      ? item.image_icon
                                      : item.image
                                    : "/assets/images/noImage.jfif"
                                }
                                height={"60px"}
                              />
                            </span>
                            <div className="subjectDetails">
                              <p className="sub_name">{item.title}</p>
                              {rApi[1] == 0 && layer1Data?.type == "pdf" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} PDF's
                                </p>
                              )}
                              {rApi[1] == 0 && layer1Data?.type == "video" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Videos
                                </p>
                              )}
                              {rApi[1] == 0 && layer1Data?.type == "test" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Tests
                                </p>
                              )}
                              {rApi[1] == 0 && layer1Data?.type == "link" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Links
                                </p>
                              )}
                              {rApi[1] == 0 && layer1Data?.type == "image" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} images
                                </p>
                              )}
                              {rApi[1] == 0 && layer1Data?.type == "concept" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} concepts
                                </p>
                              )}
                              {rApi[1] == 1 && layer1Data?.type == "pdf" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Pdf's
                                </p>
                              )}
                              {rApi[1] == 1 && layer1Data?.type == "video" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Videos
                                </p>
                              )}
                              {rApi[1] == 1 && layer1Data?.type == "test" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Tests
                                </p>
                              )}
                              {rApi[1] == 1 && layer1Data?.type == "link" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Links
                                </p>
                              )}
                              {rApi[1] == 1 && layer1Data?.type == "image" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} images
                                </p>
                              )}
                              {rApi[1] == 1 && layer1Data?.type == "concept" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} concepts
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="pg-sb-topic pe-2">
                            <span className="rightChevron">
                              <IoIosArrowForward />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  showLayer == "layer1" &&
                  layer1Data &&
                  layer1Data?.meta?.list?.map((item, i) => {
                    return (
                      <div
                        className=" pg-tabs-description mt-3"
                        onClick={() => handleLayer1Click(i, item)}
                        key={i}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="tabs-deschovr d-flex align-items-center rounded">
                          <div
                            className="pg-sb-topic d-flex align-items-center"
                            style={{ width: "97%" }}
                          >
                            <span className="videoimage">
                              <img
                                src={
                                  item.image_icon
                                    ? item.image_icon.length
                                      ? item.image_icon
                                      : item.image
                                    : "/assets/images/noImage.jfif"
                                }
                                height={"60px"}
                              />
                            </span>
                            <div className="subjectDetails">
                              <p className="sub_name">{item.title}</p>
                              {rApi[1] == 0 && (
                                <p className="m-0 sub_topics">
                                  {item?.list?.length} Topics
                                </p>
                              )}
                              {rApi[1] == 2 && courseDetail?.type == "video" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Videos
                                </p>
                              )}
                              {rApi[1] == 2 && courseDetail?.type == "pdf" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} PDF's
                                </p>
                              )}
                              {rApi[1] == 2 && courseDetail?.type == "test" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Tests
                                </p>
                              )}
                              {rApi[1] == 2 && layer1Data?.type == "link" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} Links
                                </p>
                              )}
                              {rApi[1] == 2 && layer1Data?.type == "image" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} images
                                </p>
                              )}
                              {rApi[1] == 2 && layer1Data?.type == "concept" && (
                                <p className="m-0 sub_topics">
                                  {item?.count} concepts
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="pg-sb-topic pe-2">
                            <span className="rightChevron text-center">
                              <IoIosArrowForward />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      </>
      :
       <ErrorPage />
      }
    </>
  );
};

export default Notes;
