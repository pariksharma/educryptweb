import React, { useEffect, useState, Suspense, lazy } from "react";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
// import LiveClassCard from "../cards/liveClassCard";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import { getLiveCourseService } from "@/services";
import LoaderAfterLogin from "../loaderAfterLogin";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import { useRouter } from "next/router";
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';

const LiveClassCard = lazy(() => import("../cards/liveClassCard"));

const LiveClass = ({title}) => {

  const [key, setKey] = useState('LIVE');
  const [liveCourses, setLiveCourses] = useState([]);
  const [showError, setShowError] = useState(false)
  const token = get_token();
  const router = useRouter()

  const handleTabChange = (k) => {
    setKey(k);
  };

  // console.log(key)

  useEffect(() => {
    setShowError(false)
    setLiveCourses([])
    if (key == "LIVE") {
      fetchLiveCourse(0);
    }
    else if (key == "UPCOMING") {
      fetchLiveCourse(1);
    }
    else {
      fetchLiveCourse(2);
    }
  }, [key])

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);


  const fetchLiveCourse = async (value) => {
    try {
      const formData = {
        page: 1,
        type: value
      }
      const response_getLiveCourse_service = await getLiveCourseService(encrypt(JSON.stringify(formData), token));
      const response_getLiveCourse_data = decrypt(response_getLiveCourse_service.data, token);
      // console.log('response_getLiveCourse_data', response_getLiveCourse_data);
      if (response_getLiveCourse_data.status) {
        if (response_getLiveCourse_data?.data?.length == 0) {
          setShowError(true)
        }
        else setLiveCourses(response_getLiveCourse_data.data);
      }
      else if (response_getLiveCourse_data.message == msg) {
        // console.log('hhhhhh')
        // toast.error(response_getLiveCourse_data.message);
        localStorage.removeItem("jwt");
        localStorage.removeItem("user_id");
        // location.href("/")
        router.push("/");
        setLiveCourses([])
        setShowError(true)
      } else {
        // toast.error(response_getLiveCourse_data.message);
        setLiveCourses([])
        setShowError(true)
      }
    } catch (error) {
      console.log("error found: ", error)
      router.push("/");
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name={title} content={title} />
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
      {/* <SearchCourses /> */}
      <section className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <Tabs
              defaultActiveKey="LIVE"
              id="uncontrolled-tab-example"
              className="CustomTab mb-3"
              activeKey={key}
              onSelect={(k) => handleTabChange(k)}
            >
              <Tab eventKey="LIVE" title="LIVE">
                <div className="row">
                  {liveCourses?.length > 0 ?
                    <Suspense fallback={<LoaderAfterLogin />}>
                      {liveCourses.map((item, index) => {
                        return <LiveClassCard courseData={item} value={key} key={index} />
                      })}
                    </Suspense>
                    :
                    <>
                      {showError ?
                        <ErrorPageAfterLogin />
                        :
                        <LoaderAfterLogin />
                      }
                    </>
                  }
                </div>
              </Tab>
              <Tab eventKey="UPCOMING" title="UPCOMING">
                <div className="row">
                  {liveCourses?.length > 0 ?
                    <Suspense fallback={<LoaderAfterLogin />}>
                      {liveCourses.map((item, index) => {
                        return <LiveClassCard courseData={item} value={key} key={index} />
                      })}
                    </Suspense>
                    :
                    <>
                      {showError ?
                        <ErrorPageAfterLogin />
                        :
                        <LoaderAfterLogin />
                      }
                    </>
                  }
                </div>
              </Tab>
              <Tab eventKey="COMPLETED" title="COMPLETED">
                <div className="row">
                  {liveCourses?.length > 0 ?
                    <Suspense fallback={<LoaderAfterLogin />}>
                      {liveCourses.map((item, index) => {
                        return <LiveClassCard courseData={item} value={key} key={index} />
                      })}
                    </Suspense>
                    :
                    <>
                      {showError ?
                        <ErrorPageAfterLogin />
                        :
                        <LoaderAfterLogin />
                      }
                    </>
                  }
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </section>
    </>
  );
};

const msg = "You are already logged in with some other devices, So you are logged out from this device. 9"

export default LiveClass;
