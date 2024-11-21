import React, { useEffect, useState, Suspense, lazy } from "react";
import { useSelector } from 'react-redux'
// import Card1 from '../cards/card1'
import { decrypt, encrypt, get_token } from '@/utils/helpers'
import { getCourse_service } from '@/services'
import { useRouter } from 'next/router'
// import SearchCourses from '../searchCourses/searchCourses'
import ErrorPage from '../errorPage'
import Loader from '../loader'
import ErrorPageAfterLogin from '../errorPageAfterLogin'
import LoaderAfterLogin from '../loaderAfterLogin'
import Head from 'next/head';

const SearchCourses = lazy(() => import("../searchCourses/searchCourses"));
const Card1 = lazy(() => import("../cards/card1"));

const Bookstore = ({title}) => {

  const [banner, setBanner] = useState([])
  const [bookstoreData, setBookstoreData] = useState([])
  const [getCourses, setGetCourses] = useState([])
  const [filterCoursesList, setFilterCoursesList] = useState([]);
  const [showError, setShowError] = useState(false)

  const router = useRouter()

  const contentData = useSelector((state) => state?.allCategory?.content)
  // console.log('conterntData' , contentData)
  useEffect(() => {
    if (contentData?.banner_list_web?.length > 0) {
      setBanner(contentData.banner_list_web[0]?.banner_url);
    }
    if (contentData?.course_type_master) {
      setBookstoreData(contentData?.course_type_master.filter((item) => item.cat_type == 1))
    }
  }, [contentData])

  useEffect(() => {
    setShowError(false)
    // console.log('bd' , bookstoreData)
    if (bookstoreData?.length > 0) {
      fetchCategoryData(bookstoreData[0]?.id)
    }
  }, [bookstoreData])
  // console.log('bookstore', contentData?.course_type_master)

  const fetchCategoryData = async (id) => {
    try {
      const token = get_token();
      const formData = {
        course_type: id,
        page: 1,
        sub_cat: 1,
        main_cat: 0,
        // 'course_ids': id
      };
      const response_getCourse_service = await getCourse_service(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getCourse_data = decrypt(
        response_getCourse_service.data,
        token
      );
      // console.log("response_getCourse_data", response_getCourse_data);
      if (response_getCourse_data?.status) {
        if (response_getCourse_data?.data?.length == 0) {
          setShowError(true)
        }
        else {
          setGetCourses(response_getCourse_data.data);
          setFilterCoursesList(response_getCourse_data.data)
          // console.log("bookstoreData", response_getCourse_data.data);
        }
      }
      else {
        setGetCourses([]);
        setFilterCoursesList([])
        setShowError(true)
      }
    } catch (error) {
      console.log("error found: ", error)
      router.push('/')
    }
  };

  const handleDetail = (value) => {
    // console.log("detailesss", value);
    router.push(`/private/myProfile/detail/${"Bookstore" + ":" + value.id + "&" + value.combo_course_ids + 'parent:'}`)
  }

  const handleFilterCourses = (filterCourses, searchInputValue) => {
    if (filterCourses?.length > 0) {
      setFilterCoursesList(filterCourses)
    }
    else {
      if (searchInputValue == '') {
        setFilterCoursesList(getCourses);
      }
      else {
        setFilterCoursesList([])
        setShowError(true)
      }
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name={title} content={title} />
      </Head>
      {banner &&
        <section className="container-fluid">
          <div className="row">
            <div className="col-md-12 mb-5">
              <img className='profileBanImg w-100' src={banner ? banner : ''} alt="" />
            </div>
          </div>
        </section>
      }
      <Suspense fallback={<LoaderAfterLogin />}>
        <SearchCourses catId={bookstoreData[0]?.id} handleFilterCourses={handleFilterCourses} />
      </Suspense>
      <section className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <p className="m-0 mb-4 tab_text" dangerouslySetInnerHTML={{ __html: bookstoreData[0]?.description }}>
              {/* {bookstoreData[0]?.description} */}
            </p>
          </div>
          {filterCoursesList?.length > 0 ?
            <Suspense fallback={<LoaderAfterLogin />}>
              {filterCoursesList.map((item, index) => {
                return (
                  <Card1 value={item} titleName={bookstoreData[0]?.name} key={index} handleDetail={handleDetail} />
                )
              })}
            </Suspense>
            :
            <>
              {showError ?
                <ErrorPageAfterLogin />
                :
                <LoaderAfterLogin />}
            </>
          }
        </div>
      </section>
    </>
  )
}

export default Bookstore