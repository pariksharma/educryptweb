import React, { useEffect, useState, useRef, useCallback, Suspense, lazy } from "react";
import Header from "../../../component/header/header";
import Footer from "../../../component/footer/footer";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaShare } from "react-icons/fa";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useRouter } from "next/router";
import { get_token, encrypt, decrypt, userLoggedIn, isValidData } from "@/utils/helpers";
import { IoStar } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card3 from "@/component/cards/card3";
import { freeTransactionService, getCourseDetail_Service, getFPaymentService } from "@/services";
import Button1 from "@/component/buttons/button1/button1";
import LoginModal from "@/component/modal/loginModal";
import { useDispatch, useSelector } from "react-redux";
import ThankyouModal from "@/component/modal/thankyouModal";
import Loader from "@/component/loader";
import dynamic from 'next/dynamic';
import { reset_tab } from "@/store/sliceContainer/masterContentSlice";
import Head from 'next/head';

const CourseDetail = dynamic(() => import('@/component/courseDetail/courseDetail'), 
{ ssr: false, loading: () => <Loader /> });
const ComboCourse = dynamic(() => import('@/component/comboCourse/comboCourse'), 
{ ssr: false, loading: () => <Loader /> });
const Notes = dynamic(() => import('@/component/notes/notes'), 
{ ssr: false, loading: () => <Loader /> });

// const CourseDetail = lazy(() => import("@/component/courseDetail/courseDetail"));
// const ComboCourse = lazy(() => import("@/component/comboCourse/comboCourse"));
// const Notes = lazy(() => import("@/component/notes/notes"));

const ViewOnlineCourseDetail = ({ initialData, onlineCourseDetailID, IsTranding }) => {
  const router = useRouter();
  const resetLayerRef = useRef();
  const [serverError, setServerError] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [thankYouModalShow, setThankYouModalShow] = useState(false);
  const [showError, setShowError] = useState(false);
  const [tiles, setTiles] = useState(initialData?.tiles || []);
  const [key, setKey] = useState(null);
  const [onlineCourseAry, setOnlineCourseAry] = useState(initialData?.courseDetail || "");
  const [relateCourseAry, setRelateCourseAry] = useState(initialData?.relatedCourses || "");
  const [courseDetail, setCourseDetail] = useState(initialData?.tiles || "");
  const [id, setId] = useState(initialData?.courseID || "");
  const [titleName, setTitleName] = useState(initialData?.title || "");
  const [contentData, setContentData] = useState([]);
  // const { onlineCourseDetailID, IsTranding } = router.query;

  const dispatch = useDispatch()
  const versionData = useSelector((state) => state.allCategory?.versionData);
  const displayTabData = useSelector((state) => state.allCategory?.tabName);

  const [pdfData, setPdfData] = useState("");
  let courseCombo = onlineCourseDetailID?.slice(
    onlineCourseDetailID?.indexOf("&") + 1,
    onlineCourseDetailID?.indexOf("parent:")
  );
  let parentId = onlineCourseDetailID?.slice(
    onlineCourseDetailID?.indexOf("parent:") + 7,
    onlineCourseDetailID?.length
  );
  const token = get_token();

  const [classSet, setClass] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const OverView = tiles.find((item) => (item.type == "overview"));


  // console.log("initialData", initialData)

  // useEffect(() => {
    
  //   const handleScroll = () => {
  //     if (typeof window !== 'undefined') {
  //       const currentScrollY = window.scrollY;
  //       setClass(currentScrollY > 0);
  //     }
  //   };
  //   if (typeof window !== 'undefined') {
  //     window.addEventListener("scroll", handleScroll);
  //   }
  //   return () => {
  //     if (typeof window !== 'undefined') {
  //       window.removeEventListener("scroll", handleScroll);
  //     }
  //   };
  // }, []);

  useEffect(() => {
    // Getting the heights of the elements once after the component mounts
    // console.log("pageSection1", pageSection1);
    // console.log("offset1", offset1);
    const handleScroll = () => {
      let pageSection1 = document.querySelector(".page-section-1")?.offsetHeight;
      let offset1 = document.querySelector(".offset--1")?.offsetHeight || 0;
      let pageSection6 = document.querySelector(".page-section-6")?.offsetHeight || 0;
      let currentScrollY = window.scrollY;
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
    if (typeof window !== 'undefined') {
      // Attach the scroll event listener
      window.addEventListener("scroll", handleScroll);

      // Clean up the event listener on component unmount
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const fetchCourseDetail = useCallback(async (course_id) => {
    try {
      const formData = {
        course_id: course_id,
        // page: 1,
        parent_id: courseCombo ? "" : parentId ? parentId : course_id,
        // parent_id: 0
      };
      const response_getCourseDetail_service = await getCourseDetail_Service(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getCourseDetail_data = decrypt(
        response_getCourseDetail_service.data,
        token
      );
      if (response_getCourseDetail_data.status) {
        setOnlineCourseAry(response_getCourseDetail_data?.data?.course_detail);
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
        setKey(
          response_getCourseDetail_data?.data?.tiles?.find(
            (item) => (item.type == "overview")
          )?.tile_name
            ? response_getCourseDetail_data?.data?.tiles?.find(
              (item) => (item.type == "overview")
            )?.tile_name : response_getCourseDetail_data?.data?.tiles[0]?.tile_name
        );
        setContentData(
          response_getCourseDetail_data?.data?.tiles
            ?.find(
              (item) => item.type == "content" || item.type == "course_combo"
            )
            ?.meta?.list?.find((item) => item.id == id)
        );
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
      setServerError(true);
    }
  }, []);

  useEffect(() => {
    if (router.isReady && router.query.onlineCourseDetailID) {
      const courseID = router.query.onlineCourseDetailID.split(":")[1].split("&")[0];
      const title = router.query.onlineCourseDetailID.split(":")[0];
      setId(courseID);
      setTitleName(title);
      fetchCourseDetail(courseID);
    }
  }, [router.isReady, router.query.onlineCourseDetailID, fetchCourseDetail]);

  useEffect(() => {
    setShowError(false);
    if (displayTabData?.tab) {
      setKey(displayTabData?.tab);
    } else {
      setKey(tiles.find((item) => item.type == "overview")?.tile_name);
    }
  }, [tiles]);

  const handleAddToMyCourse = async () => {
    try {
      if (userLoggedIn()) {
        const formData = {
          course_id: id,
          pay_via: 3,
          quantity: 1,
          type: 1,
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

  const handleTabChange = (k) => {
    setKey(k);
    // console.log("k 83", k);
    dispatch(reset_tab())
    // console.log('k', k)
    if (resetLayerRef.current) {
      resetLayerRef.current.click();
    }
  }

  const handleBackdetails = () => {
    if (IsTranding) {
      router.push("/");
    } else {
      const back = localStorage.getItem("previousTab");
      console.log("back",back)
      if (back) {
        router.push(back);
      } else {
        router.back();
      }
    }
  };

  const handleBuy = () => {
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      const currentPath = router.asPath;
      localStorage.setItem("redirectAfterLogin", currentPath);
      // localStorage.setItem("previousTab", router.pathname);
      router.push(
        `/view-courses/course-order/${titleName + ":" + onlineCourseAry.id + "&" + courseCombo
        }`
      );
    } else {
      setModalShow(true);
    }
  };

  return (
    <>
     <Head>
        <title>{onlineCourseAry?.title}</title>
        <meta name={onlineCourseAry?.title} content={onlineCourseAry?.title} />
      </Head>
      <ToastContainer position="top-right" autoClose={1000} />
      <LoginModal show={modalShow} onHide={() => setModalShow(false)} />
      <ThankyouModal show={thankYouModalShow} onHide={() => setThankYouModalShow(false)} />
      <Header search={"disable"} />
      {onlineCourseAry ? (
        <>
          <section className="detailTopContainer">
            <div className="mb-4 container-fluid p-0">
              <div className="row">
                <div className="col-md-12">
                  <nav aria-label="breadcrumb ">
                    <ol className="m-0 breadcrumb cursor">
                      <li
                        className="breadcrumb-item"
                        onClick={() => router.push("/")}
                      >
                        {`Home`}
                        <i className="bi bi-chevron-right"></i>
                      </li>
                      {!titleName.startsWith("Free") &&
                        (onlineCourseAry.mrp != 0 || titleName) &&
                        titleName && (
                          <li
                            className="breadcrumb-item"
                            onClick={handleBackdetails}
                          >
                            {`${titleName}`}
                            <i className="bi bi-chevron-right"></i>
                          </li>
                        )}
                      <li className="breadcrumb-item active">
                        {`Details`}
                        <i className="bi bi-chevron-right"></i>
                      </li>
                    </ol>
                  </nav>
                  <div className="courseTitle">
                    <h4 className="m-0 mb-3">{onlineCourseAry?.title}</h4>
                  </div>
                  <div className="mb-3 d-flex flex-wrap flex-sm-nowrap courseDuration">
                    {contentData?.segment_information && (
                      <p className="m-0 me-4">
                        {contentData.segment_information}
                      </p>
                    )}
                    {onlineCourseAry?.cat_type != 1 &&
                      onlineCourseAry.mrp != 0 &&
                      onlineCourseAry?.validity != "0 Days" && (
                        <p>
                          <span>
                            <IoDocumentTextOutline className="video_icon" />
                          </span>{" "}
                          Validity: {`${onlineCourseAry?.validity}`}
                        </p>
                      )}
                  </div>
                  <div className="d-flex mb-3 freeCourserate">
                    <p className="m-0">
                      <span className="freeRating">
                        <IoStar />{" "}
                        {onlineCourseAry.avg_rating
                          ? parseFloat(onlineCourseAry.avg_rating).toFixed(1)
                          : "0.0"}
                      </span>
                    </p>
                    <p className="m-0 freeCourseReview d-flex align-items-center">
                      {onlineCourseAry.user_rated} Reviews &nbsp;{" "}
                    </p>
                  </div>
                  {onlineCourseAry.mrp != 0 && (
                    <div className="gap-2 d-flex flex-wrap flex-sm-nowrap align-items-center button_price">
                      <div className="gap-2 share d-flex align-items-center">
                        {/* {versionData?.share_content == 1 && (
                          <button className="button1_share">
                            <FaShare />
                          </button>
                        )} */}
                        {onlineCourseAry.is_purchased == 0 && (
                          <p className="m-0 detailBbuyNow">
                            <Button1
                              value={"Buy Now"}
                              handleClick={handleBuy}
                            />
                          </p>
                        )}
                      </div>
                      {onlineCourseAry.is_purchased == 0 && (
                        <div className="m-0">
                          <div className="m-0 gap-2 d-flex align-items-center">
                            <span className="costPrice">
                              {/* <FaRupeeSign className="rupeeSign" /> */}₹
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
                                    ₹{onlineCourseAry.course_sp}
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
                  <div
                    className={`d-none d-md-none d-lg-block MainCourseCard ${classSet ? "MainCourseCardAB" : "MainCourseCardFX"
                      }`}
                  >
                    <Card3
                      value={onlineCourseAry}
                      titleName={titleName}
                      courseCombo={courseCombo}
                      handleAddToMyCourse={handleAddToMyCourse}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="container-fluid p-0">
            <div className="course_mainContainer tabs_design__">
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
                      // item.type !== "content" &&
                        (item.type !== "content" &&
                        item.type !== "faq" &&
                        item.type !== "overview" &&
                        item.type !== "image" &&
                        item.type !== "concept") &&
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
                              item.type == "video") && (
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
      ) : (
        <>
          {showError ? (
            <div>
              <img src="/assets/images/detailErrorImg.svg" alt="" />
              <h4>No Data found!</h4>
            </div>
          ) : serverError ? (
            <section className="detailTopContainer">
              <div className="mb-4 container-fluid p-0">
                <div className="d-flex justify-content-center align-item-center">
                  <h1 className="text-danger">Internal Server Error ....</h1>
                </div>
              </div>
            </section>
          ) : (
            <Loader />
          )}
        </>
      )}
      <Footer />
    </>
  );
};

export async function getServerSideProps(context) {
  const { onlineCourseDetailID, IsTranding } = context.query;
  const token = get_token();

  try {
    const title = onlineCourseDetailID.split(":")[0];
    let courseCombo = onlineCourseDetailID?.slice(
      onlineCourseDetailID?.indexOf("&") + 1,
      onlineCourseDetailID?.indexOf("parent:")
    );
    let parentId = onlineCourseDetailID?.slice(
      onlineCourseDetailID?.indexOf("parent:") + 7,
      onlineCourseDetailID?.length
    );
    // console.log("courseCombo", courseCombo)
    // console.log("onlineCourseDetailID", onlineCourseDetailID)
    const courseID = onlineCourseDetailID?.slice(
      onlineCourseDetailID.indexOf(":") + 1,
      onlineCourseDetailID.indexOf("&")
    );
    // console.log("parentId", parentId)
    const formData = {
      course_id: courseID,
      parent_id: courseCombo ? "" : parentId ? parentId : courseID,
    };
    // console.log("formData", formData)
    // console.log("encrypt(JSON.stringify(formData)", encrypt(JSON.stringify(formData)))

    const response = await getCourseDetail_Service(encrypt(JSON.stringify(formData), token));
    // console.log("response", response)
    const data = decrypt(response.data, token);
    // console.log("data", data)

    return {
      props: {
        initialData: {
          courseDetail: data?.data?.course_detail || null,
          tiles: data?.data?.tiles || null,
          relatedCourses: data?.data?.related_courses || null,
          courseID,
          title,
        },
        onlineCourseDetailID: onlineCourseDetailID,
        IsTranding: IsTranding || null
      }
    };
  } catch (error) {
    // console.error("Error fetching data on server side:", error);
    return {
      props: {
        initialData: null
      }
    };
  }
}

export default ViewOnlineCourseDetail;
