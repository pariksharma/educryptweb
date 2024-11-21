import React, { useState, useRef, useCallback, Suspense, lazy } from "react";
import Header from "../../component/header/header";
import Footer from "../../component/footer/footer";
import { useRouter } from "next/router";
import { get_token, isValidData, encrypt, decrypt } from "@/utils/helpers";
import { getCourse_service, getCourse_Catergory_Service } from "@/services";
import { useSelector } from "react-redux";
import ErrorPage from "@/component/errorPage";
import Loader from "@/component/loader";
import dynamic from 'next/dynamic';
import Head from 'next/head';


const Card1 = dynamic(() => import('@/component/cards/card1'), 
{ ssr: false, loading: () => <Loader /> });

const OC_image = "/assets/images/courseRightImg.svg";

const OnlineCourse = ({ onlineCourseID, initialData }) => {
  const [showError, setShowError] = useState(false);
  const [key, setKey] = useState("Course Detail");
  const [onlineCourse, setOnlineCourse] = useState(initialData || "");
  const [id, setId] = useState("");
  const [titleName, setTitleName] = useState("");
  const [cat_description, setCat_description] = useState("");
  const [onlineCourse_ID, setonlineCourse_ID] = useState(onlineCourseID);
  const resetPdfLayerRef = useRef();
  const resetCourseCurriculumLayerRef = useRef();
  const Router = useRouter();
  const courseTypeData = useSelector(
    (state) => state.allCategory?.allCategory?.course_type_master
  );

  const fetchCourseDetail = useCallback(async (id) => {
    try {
      const token = get_token();
      const formData = {
        course_type: id,
        page: 1,
        sub_cat: 1,
        main_cat: 0,
      };
      const response_getCourse_service = await getCourse_service(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getCourse_data = decrypt(
        response_getCourse_service.data,
        token
      );
      if (response_getCourse_data.status) {
        if (response_getCourse_data?.data?.length === 0) {
          setShowError(true);
        } else {
          setOnlineCourse(response_getCourse_data?.data);
        }
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.log("Error fetching course details:", error);
      setShowError(true);
    }
  }, []);

  React.useEffect(() => {
    const { onlineCourseID } = Router.query;
    if (onlineCourseID) {
      setonlineCourse_ID(onlineCourseID);
    }
  }, [Router.query]);

  React.useEffect(() => {
    if (onlineCourse_ID) {
      fetchCourseDetail(
        onlineCourse_ID.slice(
          onlineCourse_ID.indexOf(":") + 1,
          onlineCourse_ID.length
        )
      );
      setId(
        onlineCourse_ID.slice(
          onlineCourse_ID.indexOf(":") + 1,
          onlineCourse_ID.length
        )
      );
      setTitleName(onlineCourse_ID.slice(0, onlineCourse_ID.indexOf(":")));
    }
  }, [onlineCourse_ID, courseTypeData]);

  React.useEffect(() => {
    if (titleName) {
      setCat_description(
        courseTypeData &&
          courseTypeData.filter((item) => item.name === titleName)
      );
    }
  }, [titleName, courseTypeData]);

  return (
    <>
    <Head>
        <title>{titleName}</title>
        <meta name={titleName} content={titleName} />
      </Head>
      <Header />
      <div className="container-fluid p-0">
        <div
          className={
            titleName &&
            (titleName === "Bookstore" ||
              titleName === "e-BOOK" ||
              titleName === "Books" ||
              titleName.startsWith("Boo"))
              ? `bookStoreContainer row`
              : `course_Container row`
          }
        >
          <div className="col-md-12 m-0" style={{ paddingTop: "15px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 cursor">
                <li className="breadcrumb-item" onClick={() => Router.push('/')}>
                  {`Home`}
                  <i className="bi bi-chevron-right"></i>
                </li>
                <li className="breadcrumb-item active">
                  {`${titleName}`}
                  <i className="bi bi-chevron-right"></i>
                </li>
              </ol>
            </nav>
          </div>
          <div
            className={`col-sm-12 col-md-8
              ${
                titleName &&
                (titleName === "Bookstore" ||
                  titleName === "e-BOOK" ||
                  titleName === "Books" ||
                  titleName.startsWith("Boo"))
                  ? `col-lg-6`
                  : `col-lg-8`
              }`}
          >
            <div className="onlineCourseTitle">
              <p className="mb-1 title">{titleName}</p>
              <p
                className="onlineCourseDetail"
                dangerouslySetInnerHTML={{
                  __html: cat_description && cat_description[0]?.description,
                }}
              ></p>
            </div>
          </div>
          <div
            className={`col-sm-12 col-md-4 d-none d-sm-none d-md-none d-lg-block course_imageContainer ${
              titleName &&
              (titleName === "Bookstore" ||
                titleName === "e-BOOK" ||
                titleName === "Books" ||
                titleName.startsWith("Boo"))
                ? `col-lg-6`
                : `col-lg-4`
            }`}
          >
            <div className="imgContainer">
              {titleName &&
              (titleName === "Bookstore" ||
                titleName === "e-BOOK" ||
                titleName === "Books" ||
                titleName.startsWith("Boo")) ? (
                <img
                  className="bookImg pb-4"
                  src="/assets/images/bookStoreRightImg.svg"
                  alt=""
                />
              ) : (
                <img src={OC_image} alt="" />
              )}
            </div>
          </div>
        </div>
        <div className="course_cardContainer mb-3">
          <div className="row">
            {onlineCourse?.length > 0 ? (
              <Suspense fallback={<Loader />}>
                {onlineCourse.map((item, index) => (
                  <Card1 value={item} titleName={titleName} key={index} />
                ))}
              </Suspense>
            ) : showError ? (
              <ErrorPage />
            ) : (
              <Loader />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Server-side rendering with getServerSideProps
export async function getServerSideProps(context) {
  const { query } = context;
  const onlineCourseID = query.onlineCourseID || "";
  let initialData = null;

  try {
    const token = get_token();
    const formData = {
      course_type: onlineCourseID.split(":")[1],
      page: 1,
      sub_cat: 1,
      main_cat: 0,
    };
    const response = await getCourse_service(encrypt(JSON.stringify(formData), token));
    const decryptedData = decrypt(response.data, token);
    if (decryptedData.status) {
      initialData = decryptedData?.data || [];
    }
  } catch (error) {
    console.log("Error fetching data in SSR:", error);
  }

  return {
    props: {
      onlineCourseID,
      initialData,
    },
  };
}

export default OnlineCourse;
