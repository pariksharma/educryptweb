import React, { useEffect, useState, Suspense, lazy } from "react";
import { getMyCourseService } from "@/services";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useRouter } from "next/router";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import Card4 from "../cards/card4";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import LoaderAfterLogin from "../loaderAfterLogin";
import Head from 'next/head';

const Card4 = lazy(() => import("../cards/card4"));

const MyCourse = () => {
  const [showDetail, setShowDetail] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showError2, setShowError2] = useState(false)
  const [getCourse, setGetCourse] = useState("");
  const [myCourseData, setMyCourseData] = useState([]);
  const [FreeCourseData, setFreeCourseData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setShowError(false);
    fetchMyCourseService();
    setShowDetail(false);
  }, [getCourse]);

  useEffect(() => {
    setShowError(false);
    setShowError2(false)
    return () => {
      toast.dismiss();
    };
  }, []);

  // useEffect(() => {
  //   if(myCourseData?.length == 0) {
  //     setShowError(true)
  //   }
  //   else if(FreeCourseData?.length == 0) {
  //     setShowError2(true)
  //   }
  //   else{
  //     setShowError(false)
  //     setShowError2(false)
  //   }
  // }, [myCourseData, FreeCourseData])

  const fetchMyCourseService = async () => {
    try {
      const token = get_token();
      const formData = {};
      const response_MyCourse_service = await getMyCourseService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_MyCourse_data = decrypt(
        response_MyCourse_service?.data,
        token
      );
      // console.log('response_MyCourse_data', response_MyCourse_data)
      if (response_MyCourse_data?.status) {
        if (response_MyCourse_data?.data?.length < 0) {
          setShowError(true);
          setShowError2(true)
        } else {
          setMyCourseData(
            response_MyCourse_data.data.filter((item) => item?.mrp != 0)
          );
          setFreeCourseData(
            response_MyCourse_data.data.filter((item) => item?.mrp == 0)
          );

          if ((response_MyCourse_data.data.filter((item) => item?.mrp != 0)?.length == 0)) {
            setShowError(true)
          }
          if ((response_MyCourse_data.data.filter((item) => item?.mrp == 0)?.length == 0)) {
            setShowError2(true)
          }
        }
      } else if (response_MyCourse_data.message == msg) {
        // console.log('66767678')
        setShowError(true);
        setShowError2(true)
        if (response_MyCourse_data.message) {
          toast.error(response_MyCourse_data.message);
        }
        localStorage.removeItem("jwt");
        localStorage.removeItem("user_id");
        // location.href("/")
        router.push("/");
      } else {
        // console.log('66767678')
        setShowError(true);
        setShowError2(true)
        // if(response_MyCourse_data.message){
        //   toast.error(response_MyCourse_data.message);
        // }
      }
    } catch (error) {
      console.log("error Found: ", error);
    }
  };

  // console.log('showError', showError)

  const handleDetail = (value) => {
    // console.log("detailesss", value);
    router.push(
      `/private/myProfile/detail/${"MyCourse" + ":" + value.id + "&" + value.combo_course_ids + "parent:"
      }`
    );
  };

  const handleShowDetail = () => {
    // console.log('helo')
    setShowDetail(false);
  };

  // console.log('showDetail', showDetail)
  return (
    <>
      <Head>
        <title>{'My Courses'}</title>
        <meta name={'My Courses'} content={'My Courses'} />
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

      <section className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <Tabs
              defaultActiveKey="PAID COURSES"
              id="uncontrolled-tab-example"
              className="mb-3 CustomTab"
            >
              <Tab eventKey="PAID COURSES" title="PAID COURSES">
                <div className="container-fluid">
                  <div className="row">
                    {myCourseData?.length > 0 ? (
                      <Suspense fallback={<LoaderAfterLogin />}>
                        {myCourseData.map((item, index) => {
                          return (
                            item.mrp !== 0 && (
                              <div
                                className="col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3 mb-4 p-0"
                                key={index}
                              >
                                <Card4
                                  value={item}
                                  titleName={""}
                                  handleDetail={handleDetail}
                                  titleId="PAID COURSES"
                                  detail={false}
                                  setGetCourse={setGetCourse}
                                />
                              </div>
                            )
                          );
                        })}
                      </Suspense>
                    ) : (
                      <>
                        {showError ? (
                          <ErrorPageAfterLogin />
                        ) : (
                          <LoaderAfterLogin />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Tab>
              <Tab eventKey="FREE COURSES" title="FREE COURSES">
                <div className="container-fluid">
                  <div className="row">
                    {/* {console.log()} */}
                    {FreeCourseData?.length > 0 ? (
                      FreeCourseData.map((item, index) => {
                        return (
                          item.mrp == 0 && (
                            <div
                              className="col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3 mb-4 p-0"
                              key={index}
                            >
                              <Suspense fallback={<LoaderAfterLogin />}>
                                <Card4
                                  value={item}
                                  titleName={""}
                                  handleDetail={handleDetail}
                                  titleId="FREE COURSES"
                                  detail={false}
                                  data={true}
                                />
                              </Suspense>
                            </div>
                          )
                        );
                      })
                    ) : (
                      <>
                        <>
                          {showError2 ? (
                            <ErrorPageAfterLogin />
                          ) : (
                            <LoaderAfterLogin />
                          )}
                        </>
                      </>
                    )}
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </section>
    </>
  );
};

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default MyCourse;
