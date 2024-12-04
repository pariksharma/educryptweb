import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import { freeTransactionService, getCourseDetail_Service } from "@/services";
import {
  comboDetail,
  decrypt,
  encrypt,
  get_token,
  isOurCourse,
  isValidData,
  userLoggedIn,
} from "@/utils/helpers";
import { LiaYoutube } from "react-icons/lia";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaShare } from "react-icons/fa";
import { IoStar } from "react-icons/io5";
import { FaRupeeSign } from "react-icons/fa";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button1 from "@/component/buttons/button1/button1";
import Card3 from "@/component/cards/card3";
// import CourseDetail from "@/component/courseDetail/courseDetail";
// import Notes from "@/component/notes/notes";
import Card4 from "@/component/cards/card4";
import { useRouter } from "next/router";
import Header from "@/component/header/header";
import SideBar from "@/component/sideBar/sideBar";
import { useDispatch, useSelector } from "react-redux";
// import ComboCourse from "@/component/comboCourse/comboCourse";
import Loader from "@/component/loader";
import LoaderAfterLogin from "@/component/loaderAfterLogin";
import ErrorPageAfterLogin from "@/component/errorPageAfterLogin";
import LoginModal from "@/component/modal/loginModal";
import { reset_tab } from "@/store/sliceContainer/masterContentSlice";
import { ToastContainer, toast } from 'react-toastify';
import Head from 'next/head';

const Notes = lazy(() => import("@/component/notes/notes"));
const CourseDetail = lazy(() => import("@/component/courseDetail/courseDetail"));
const ComboCourse = lazy(() => import("@/component/comboCourse/comboCourse"));


const Details = ({ value }) => {
  const [key, setKey] = useState(null);
  const [onlineCourseAry, setOnlineCourseAry] = useState("");
  const [showError, setShowError] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [relateCourseAry, setRelateCourseAry] = useState([]);
  const [pdfData, setPdfData] = useState([]);
  const [courseDetail, setCourseDetail] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [contentData, setContentData] = useState([]);
  const [id, setId] = useState("");
  const [titleName, setTitleName] = useState("");
  // const [courseCombo, setCourseCombo] = useState("");

  const resetLayerRef = useRef();
  const displayTabData = useSelector((state) => state.allCategory?.tabName);

  const router = useRouter();
  const dispatch = useDispatch();
  const { details } = router.query;
  const reviewData = useSelector((state) => state.allCategory?.review);
  const versionData = useSelector((state) => state.allCategory?.versionData);

  let courseCombo = details?.slice(
    details?.indexOf("&") + 1,
    details?.indexOf("parent:")
  );
  let parentId = details?.slice(
    details?.indexOf("parent:") + 7,
    details?.length
  );

  const [classSet, setClass] = useState("");
  // const [courseCombo, setCourseCombo] = useState("");

  const [scrollY, setScrollY] = useState(0);

  // useEffect(() => {
  //   // Getting the heights of the elements once after the component mounts
  //   const pageSection1 =
  //     document.querySelector(".page-section-1")?.offsetHeight || 0;
  //   const offset1 = document.querySelector(".offset--1")?.offsetHeight || 0;
  //   const pageSection6 =
  //     document.querySelector(".page-section-6")?.offsetHeight || 0;
  //   // console.log("pageSection1", pageSection1);
  //   const handleScroll = () => {
  //     const currentScrollY = window.scrollY;
  //     // alert("k");
  //     setScrollY(currentScrollY);

  //     // Calculate if the currentScrollY meets the height conditions
  //     const combinedHeight = Math.max(pageSection1, offset1, pageSection6);
  //     // console.log("combinedHeight", combinedHeight);
  //     if (
  //       currentScrollY >= pageSection1 &&
  //       key === tiles?.find((item) => item.type === "overview")?.tile_name
  //     ) {
  //       setClass(true);
  //     } else {
  //       setClass(false);
  //     }
  //   };

  //   // Attach the scroll event listener
  //   window.addEventListener("scroll", handleScroll);

  //   // Clean up the event listener on component unmount
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [tiles, key]);

  useEffect(() => {
    if (details) {
      console.log("details",details)
      // window.scrollTo(0, 0);
      setId(details?.slice(details.indexOf(":") + 1, details.indexOf("&")));
      setTitleName(details?.slice(0, details.indexOf(":")));
      fetchCourseDetail(
        details?.slice(details.indexOf(":") + 1, details.indexOf("&"))
      );
      // setCourseCombo(details?.slice(details.indexOf("&") + 1, details.length));
    }
  }, [details]);

  useEffect(() => {
    setShowError(false);
    if (displayTabData?.tab) {
      setKey(displayTabData?.tab);
    } else {
      setKey(tiles.find((item) => item.type == "overview")?.tile_name);
    }
  }, [tiles]);

  useEffect(() => {
    // Getting the heights of the elements once after the component mounts
    // console.log("pageSection1", pageSection1);
    // console.log("offset1", offset1);
    const handleScroll = () => {
      const pageSection1 = document.querySelector(".page-section-1")?.offsetHeight || 0;
      const offset1 = document.querySelector(".offset--1")?.offsetHeight || 0;
      const pageSection6 = document.querySelector(".page-section-6")?.offsetHeight || 0;
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      if (pageSection1 > 0) {
        if (currentScrollY >= pageSection1) {
          setClass(true);
        } else {
          setClass(false);
        }
      } else if (offset1 > 0) {
        if (currentScrollY >= offset1) {
          setClass(true);
        } else {
          setClass(false);
        }
      } else if (pageSection6 > 0) {
        if (currentScrollY >= pageSection6) {
          setClass(true);
        } else {
          setClass(false);
        }
      }
    };
    // if (typeof window !== 'undefined') {
    // Attach the scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
    // }
  }, []);

  useEffect(() => {
    // Function to apply overflow style based on viewport size
    const updateOverflowStyle = () => {
      const currentPath = window.location.pathname; // Get only the pathname, no query strings
      const viewportWidth = window.innerWidth;

      // Check if the URL matches the desired page
      if (currentPath.includes("/private/myProfile/play/")) {
        // Apply overflow: hidden for smaller devices (<= 1024px)
        if (viewportWidth >= 1024) {
          document.documentElement.style.overflow = "hidden";
        } else {
          document.documentElement.style.overflow = "auto"; // Remove overflow: hidden for larger devices
        }
      } else {
        document.documentElement.style.overflow = "auto"; // Reset for other pages
      }
    };

    // Apply the overflow style on mount
    updateOverflowStyle();

    // Listen for window resize events to update the overflow style dynamically
    window.addEventListener("resize", updateOverflowStyle);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", updateOverflowStyle);
    };
  }, []);

  // console.log('courseCombo', courseCombo)

  const fetchCourseDetail = async (id) => {
    console.log("id",id)
    try {
      const token = get_token();
      const formData = {
        course_id: id,
        page: 1,
        parent_id: courseCombo ? "" : parentId ? parentId : id,
        // parent_id : ''
      };
      // console.log("formData", formData);
      const response_getCourseDetail_service = await getCourseDetail_Service(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getCourseDetail_data = decrypt(
        response_getCourseDetail_service.data,
        token
      );
      // console.log(
      //   "response_getCourseDetail_data56786545678",
      //   response_getCourseDetail_data
      // );
      if (response_getCourseDetail_data.status) {
        if (!response_getCourseDetail_data?.data?.course_detail) {
          setShowError(true);
        } else {
          setOnlineCourseAry(
            response_getCourseDetail_data?.data?.course_detail
          );
          setRelateCourseAry(
            response_getCourseDetail_data?.data.tiles.filter(
              (item) => item.type == "overview"
            )[0]?.meta?.related_courses
          );
          setPdfData(
            response_getCourseDetail_data?.data?.course_detail
              ?.course_syallbus_pdf
          );
          setCourseDetail(response_getCourseDetail_data?.data?.tiles);
          setTiles(response_getCourseDetail_data?.data?.tiles);
          // console.log('contentDAta', response_getCourseDetail_data?.data)
          setContentData(
            response_getCourseDetail_data?.data?.tiles
              ?.find(
                (item) => item.type == "content" || item.type == "course_combo"
              )
              ?.meta?.list?.find((item) => item.id == id)
          );
          setKey(
            response_getCourseDetail_data?.data?.tiles?.find(
              (item) => (item.type == "overview")
            )?.tile_name
              ? response_getCourseDetail_data?.data?.tiles?.find(
                (item) => (item.type == "overview")
              )?.tile_name : response_getCourseDetail_data?.data?.tiles[0]?.tile_name
          );
          // console.log("detail", response_getCourseDetail_data?.data?.tiles);
        }
      } else {
        setShowError(true);
      }
    } catch (error) {
      setServerError(true);
      console.log("error found: ", error);
    }
  };

  const handleTabChange = (k) => {
    setKey(k);
    dispatch(reset_tab())
    if (resetLayerRef.current) {
      resetLayerRef.current.click();
    }
  };

  const handleBackdetails = () => {
    const back = localStorage.getItem("redirectdetails");
    if (comboDetail(router.asPath)) {
      router.back();
    }
    else {
      if (back) {
        router.push(back);
      } else {
        router.back();
      }
    }
  };

  const handleAddToMyCourse = async () => {
    try {
      if (userLoggedIn()) {
        const token = get_token()
        const formData = {
          course_id: id,
          parent_id:0,
          coupon_applied:0
        };
        const response = await freeTransactionService(encrypt(JSON.stringify(formData), token));
        const data = decrypt(response.data, token);
        if (data.status) {
          toast.success("Added Successfully");
          router.push("/private/myProfile/myCourse");
        } else {
          toast.error(data.message);
        }
      } else {
        setModalShow(true);
      }
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const handleBuyNow = () => {
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      const currentPath = router.asPath;
      localStorage.setItem("redirectAfterLogin", currentPath);
      router.push(
        `/view-courses/course-order/${titleName + ":" + onlineCourseAry.id + "&" + courseCombo
        }`
      );
    } else {
      setModalShow(true);
    }
  };
  // console.log('tiles', tiles)

  const OverView = tiles.find((item) => item.type == "overview");
  return (
    <>
      <Head>
        <title>{onlineCourseAry?.title}</title>
        <meta name={onlineCourseAry?.title} content={onlineCourseAry?.title} />
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
      <Header />
      <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
      <div className="d-flex" style={{ marginTop: "55px" }}>
        <SideBar />
        {/* {console.log('onlineCourseAry', onlineCourseAry)} */}
        <main className="main_content pt-0 flex-grow-1">
          {onlineCourseAry ? (
            <>
              <section className="profileDetailTopContainer">
                <div className="mb-4 container-fluid p-0">
                  <div className="row">
                    <div className="col-md-12">
                      <nav aria-label="breadcrumb ">
                        <ol className="m-0 breadcrumb cursor">
                          {/* {console.log('titleName', titleName)} */}
                          <li
                            className="breadcrumb-item"
                            onClick={handleBackdetails}
                          >
                            {titleName
                              ? titleName == "MyCourse"
                                ? "My Courses"
                                : comboDetail(router.asPath) ? titleName : isOurCourse() ? "Our Course" : titleName
                              : `My Courses`}
                            <i className="bi bi-chevron-right"></i>
                          </li>
                          <li className="breadcrumb-item active">
                            {`Details`}
                            <i className="bi bi-chevron-right"></i>
                          </li>
                        </ol>
                      </nav>
                      <div className="courseTitle">
                        <h4 className="m-0 mb-3">{onlineCourseAry?.title}</h4>
                      </div>
                      <div className="mb-3 gap-1 d-flex flex-wrap flex-sm-nowrap courseDuration">
                        {contentData?.segment_information && (
                          <p className="m-0 me-4">
                            {contentData.segment_information}
                          </p>
                        )}
                        {onlineCourseAry?.cat_type != 1 &&
                          onlineCourseAry.mrp != 0 &&
                          onlineCourseAry.validity != "0 Days" && (
                            <p>
                              <span>
                                <IoDocumentTextOutline className="video_icon" />
                              </span>{" "}
                              Validity: {`${onlineCourseAry.validity}`}
                            </p>
                          )}
                      </div>
                      {!comboDetail(router.asPath) && <>
                        <div className="d-flex mb-3 freeCourserate">
                          <p className="m-0">
                            <span className="freeRating">
                              <IoStar />{" "}
                              {onlineCourseAry.avg_rating
                                ? parseFloat(onlineCourseAry.avg_rating).toFixed(
                                  1
                                )
                                : "0.0"}
                            </span>
                          </p>

                          <p className="m-0 freeCourseReview d-flex align-items-center">
                            {onlineCourseAry.user_rated} Reviews &nbsp;{" "}
                          </p>
                        </div>
                        {onlineCourseAry.mrp != 0 && (
                          <div className="gap-2 flex-wrap flex-sm-nowrap d-flex align-items-center button_price">
                            <div className="gap-2 share d-flex align-items-center">
                              {onlineCourseAry.is_purchased == 0 && (
                                <p className="m-0 detailBbuyNow">
                                  <Button1
                                    value={"Buy Now"}
                                    handleClick={handleBuyNow}
                                  />
                                </p>
                              )}
                            </div>
                            {onlineCourseAry.is_purchased == 0 && (
                              <div className="m-0">
                                <div className="m-0 gap-2 d-flex align-items-center">
                                  <span className="costPrice">
                                    {/* <FaRupeeSign className="rupeeSign" /> */}
                                    ₹
                                    {onlineCourseAry.is_gst == 0
                                      ? Number(onlineCourseAry.mrp) +
                                      Number(onlineCourseAry.tax)
                                      : onlineCourseAry.mrp}
                                  </span>
                                  {Number(onlineCourseAry.mrp) +
                                    Number(onlineCourseAry.tax) !=
                                    onlineCourseAry.course_sp && (
                                      <span className="discountPrice">
                                        <del>
                                          {/* <FaRupeeSign className="rupeeSign2" /> */}
                                          ₹
                                          {onlineCourseAry.course_sp}
                                        </del>
                                      </span>
                                    )}
                                </div>
                                <p className="m-0 ms-1 ex_gst">
                                  {onlineCourseAry.is_gst == 0
                                    ? "Inclusive of GST"
                                    : "Exclusive of GST"}{" "}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                      }
                      <div
                        className={`d-none d-md-none d-lg-block MainCourseCard ${classSet ? "MainCourseCardAB" : "MainCourseCardFX"
                          }`}
                      >
                        <Card4
                          value={onlineCourseAry}
                          titleName={titleName ? titleName : "detail"}
                          courseCombo={courseCombo}
                          handleDetail={() => console.log("detail")}
                          detail={true}
                          handleAddToMyCourse = {handleAddToMyCourse}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="container-fluid p-0">
                <div className="profileCourse_mainContainer tabs_design__">
                  <nav className="m-0 p-0">
                    <Tabs
                      id="controlled-tab-example2"
                      activeKey={key}
                      onSelect={(k) => handleTabChange(k)}
                      className=""
                    >
                      {OverView && (
                        <Tab
                          eventKey={OverView.tile_name}
                          title={OverView.tile_name}
                        // key={index}
                        // propsValue={isValidData(item) && item.tiles}
                        >
                          <Suspense fallback={<Loader />}>
                            <CourseDetail
                              title={OverView.tile_name}
                              courseDetail={courseDetail}
                              propsValue={
                                isValidData(relateCourseAry) && relateCourseAry
                              }
                              relateCourseAry={relateCourseAry}
                              course={onlineCourseAry}
                              titleName={titleName}
                            />
                          </Suspense>
                        </Tab>
                      )}
                      {tiles?.map(
                        (item, index) =>
                          (item.type !== "content" &&
                            item.type !== "faq" &&
                            item.type !== "overview" ) &&
                          !(
                            item.type == "content" &&
                            versionData.same_content_view == 1
                          ) && (
                            <Tab
                              eventKey={item.tile_name}
                              title={item.tile_name}
                              key={index}
                            >
                              {item.type !== "course_combo" &&
                                (item.type == "test" ||
                                  item.type == "pdf" ||
                                  item.type == "video" ||
                                  item.type == "link" ||
                                  item.type == "concept" ||
                                  item.type == "image") && (
                                  <Suspense fallback={<Loader />}>
                                    <Notes
                                      resetRef={resetLayerRef}
                                      courseDetail={item}
                                      CourseID={id}
                                      tabName={item.tile_name}
                                      keyValue={key}
                                      onlineCourseAry={onlineCourseAry}
                                    />
                                  </Suspense>
                                )}
                              {item.type == "course_combo" && (
                                <Suspense fallback={<Loader />}>
                                  <ComboCourse
                                    courseDetail={item}
                                    CourseID={id}
                                    tabName={item.tile_name}
                                    keyValue={key}
                                    titleName={titleName}
                                    onlineCourseAry={onlineCourseAry}
                                  />
                                </Suspense>
                              )}
                            </Tab>
                          )
                      )}
                    </Tabs>
                  </nav>
                </div>
              </div>
            </>
          ) : showError ? (
            <>
              <div className="main_content pt-0 flex-grow-1">
                <div className="container-fluid p-0">
                  <div className="row">
                    <ErrorPageAfterLogin />
                  </div>
                </div>
              </div>
            </>
          ) : serverError ? (
            <section className="detailTopContainer">
              <div className="mb-4 container-fluid p-0">
                <div className="d-flex justify-content-center align-item-center">
                  <h1 className="text-danger">Internal Server Error ....</h1>
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* <div className="spinner-border" role="status" /> */}
              <Loader />
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default Details;
