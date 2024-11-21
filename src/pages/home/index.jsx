import React, { useEffect, useState, Suspense,useRef, lazy } from "react";

// import Header from '@/component/header/header'
// import Banner from '@/component/banner/banner'
// import TrendingCourses from '@/component/trendingCourses/trendingCourses'
// import Free_Test_Course from '@/component/freeTest&Course/freeTest&Course'
// import OurProduct from '@/component/ourProducts/ourProduct'
// import Blogs from '@/component/currentAffair/currentAffair'
// import Testimonial from '@/component/testimonial/testimonial'
// import GetInTouch from '@/component/getInTouch/getInTouch'
// import Footer from '@/component/footer/footer'

import LoaderAfterLogin from "@/component/loaderAfterLogin";
import Loader from "@/component/loader";
import { getCourse_Catergory_Service, getCourse_service, getCurrentAffair_service, getMyCourseService } from '@/services'
import { useSelector, useDispatch } from 'react-redux'
import { decrypt, get_token, encrypt, userLoggedIn } from '@/utils/helpers'
import { all_CategoryAction, all_CourseAction, all_CurrentAffair } from '@/store/sliceContainer/masterContentSlice'
// import Achievement from '@/component/achievement/achievement';
import { useRouter } from 'next/router'

const DownloadSlide = lazy(() => import("@/component/downloadSlide/downloadSlide"));
const Bottom_banner = lazy(() => import("@/component/bottom_banner/bottom_banner"));
const Header = lazy(() => import("@/component/header/header"));
const Banner = lazy(() => import("@/component/banner/banner"));
const TrendingCourses = lazy(() => import("@/component/trendingCourses/trendingCourses"));
const Free_Test_Course = lazy(() => import("@/component/freeTest&Course/freeTest&Course"));
const OurProduct = lazy(() => import("@/component/ourProducts/ourProduct"));
const Blogs = lazy(() => import("@/component/currentAffair/currentAffair"));
const Testimonial = lazy(() => import("@/component/testimonial/testimonial"));
const GetInTouch = lazy(() => import("@/component/getInTouch/getInTouch"));
const Footer = lazy(() => import("@/component/footer/footer"));
const Achievement = lazy(() => import("@/component/achievement/achievement"));


const index = () => {
  const getInTouchRef = useRef(null);
  const token = get_token()
  const [isLoggedIn, setIsLoggedIn] = useState('');
  const dispatch = useDispatch();
  const router = useRouter()

  useEffect(() => {
    const loggIn = userLoggedIn();
    if (loggIn) {
      setIsLoggedIn(loggIn)
    }
    else {
      setIsLoggedIn('');
    }
  }, [])

  useEffect(() => {
    fetchCourseData();
    fetchCurrentAffair();
    if (isLoggedIn) {
      fetchMyCourseService();
    }
  }, [isLoggedIn])
  const fetchCourseData = async () => {
    try {
      const formData = {
        'course_type': 0,
        'page': 1,
        'sub_cat': 1,
        'main_cat': 0
      }
      const response_getCourse_service = await getCourse_service(encrypt(JSON.stringify(formData), token));
      const response_getCourse_data = decrypt(response_getCourse_service.data, token)
      // console.log('course', response_getCourse_data)
      if (response_getCourse_data.status) {
        dispatch(all_CourseAction(response_getCourse_data.data))
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  const fetchCurrentAffair = async () => {
    try {
      const formData = {}
      const response_getCurrentAffairs_service = await getCurrentAffair_service(encrypt(JSON.stringify(formData), token))
      const response_getCurrentAffairs_data = decrypt(response_getCurrentAffairs_service.data, token);
      if (response_getCurrentAffairs_data.status) {
        dispatch(all_CurrentAffair(response_getCurrentAffairs_data.data))
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  const fetchMyCourseService = async () => {
    try {
      const formData = {};
      const response_MyCourse_service = await getMyCourseService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_MyCourse_data = decrypt(
        response_MyCourse_service.data,
        token
      );
      if (response_MyCourse_data.message == msg) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user_id");
        router.push("/");
      } else {
        // toast.error(response_MyCourse_data.message);
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const scrollToGetInTouch = () => {
    if (getInTouchRef.current) {
      getInTouchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };


  return (
    <>
      <Suspense fallback={<Loader />}>
        <div className="nav_container fixed-top">
          <DownloadSlide  scrollToGetInTouch={scrollToGetInTouch}/>
          <Header IsHome={true} />
        </div>
        <Banner />
        <TrendingCourses />
        <Free_Test_Course />
        <OurProduct value="product" />
        <Achievement />
        <Blogs />
        <Bottom_banner />
        <Testimonial />
        <GetInTouch ref={getInTouchRef} />
        <Footer />
      </Suspense>

      {/* <Suspense fallback={<LoaderAfterLogin />}>
        <Banner />
      </Suspense>
      <Suspense fallback={<LoaderAfterLogin />}>
        <TrendingCourses />
      </Suspense>
      <Suspense fallback={<LoaderAfterLogin />}>
        <Free_Test_Course />
      </Suspense>
      <Suspense fallback={<LoaderAfterLogin />}>
        <OurProduct value="product" />
      </Suspense>
      <Suspense fallback={<LoaderAfterLogin />}>
        <Achievement />
      </Suspense>
      <Suspense fallback={<LoaderAfterLogin />}>
        <Blogs />
      </Suspense>
      <Suspense fallback={<LoaderAfterLogin />}>
        <Testimonial />
      </Suspense>
      <Suspense fallback={<LoaderAfterLogin />}>
        <GetInTouch />
      </Suspense>
      <Suspense fallback={<LoaderAfterLogin />}>
        <Footer />
      </Suspense> */}
    </>
  );
}

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default index