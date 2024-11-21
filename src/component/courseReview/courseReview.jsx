import { getCourseDetail_Service, getCourseReviewService } from '@/services';
import { decrypt, encrypt, get_token, userLoggedIn } from '@/utils/helpers';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Button1 from '../buttons/button1/button1';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { IoStar } from "react-icons/io5";
// import toast, { Toaster } from 'react-hot-toast';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from "date-fns";
import AddReviewModal from '../modal/addReviewModal';
import ReactStars from "react-rating-stars-component";
import LoginModal from '../modal/loginModal';

const CourseReview = ({courseDetail}) => {
    
  const [reviewModalShow, setReviewModalShow] = useState(false)
  const [isToasterOpen, setIsToasterOpen] = useState(false)
  const [modalShow, setModalShow] = useState(false)
  const [editReview, setEditReview] = useState(false);
  const [reviewList, setReviewList] = useState([])
  const [courseCombo, setCourseCombo] = useState('');
  const [editReviewData, setEditReviewData] = useState('');
  const [avgRating, setAvgRating] = useState(courseDetail.avg_rating);
  const [Rating,setRating] = useState(avgRating)
  const router = useRouter();
  const courseID = router.asPath.substring(router.asPath.indexOf(':') + 1, router.asPath.indexOf('&'))
  // console.log('courseDetail', courseDetail)

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(()=>{
    setRating(avgRating)
  },[avgRating,courseDetail,Rating])
  useEffect(() => {
      fetchCourseReview();
  }, [reviewModalShow])

  useEffect(() => {
    if(isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false)
      }, 1500)
    }
  }, [isToasterOpen])

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  // useEffect(() => {
  //   const details = router.asPath
  //   console.log(details?.slice(details.indexOf("&") + 1, details.length))
  //   if (details) {
  //     setCourseCombo(details?.slice(details.indexOf("&") + 1, details.length));
  //   }
  // }, []);

  useEffect(() => {
    const isLoggedIn = userLoggedIn()
    if(reviewList) {
      const alreadyReview = reviewList.filter((item) => item.id == isLoggedIn)
      // console.log('isLogged', alreadyReview)
      if(alreadyReview?.length > 0) {
        setEditReviewData(alreadyReview[0]);
        setEditReview(true);
      }
      else{
        setEditReview(false);
      }
    }
    else {
      setEditReview(false);
    }
  }, [reviewModalShow, reviewList])

  const showErrorToast = (toastMsg) => {
    toast.error(toastMsg, {
      autoClose: 1500
  });
    if (!isToasterOpen) {
      setIsToasterOpen(true);
    }
  }

  const fetchCourseReview = async () => {
    try{
      const token = get_token();
      const formData = {
        course_id: courseID
        // course_id: 107
      }
      const repsonse_CourseReview_service = await getCourseReviewService(encrypt(JSON.stringify(formData), token));
      // console.log('repsonse_CourseReview_service', repsonse_CourseReview_service)
      const response_CourseReview_data = decrypt(repsonse_CourseReview_service.data, token);
      // console.log('response_CourseReview_data', response_CourseReview_data);
      if(response_CourseReview_data.status) {
        setReviewList(response_CourseReview_data.data)
        fetchCourseDetail()
      }
      else{
        if (response_CourseReview_data.message === msg) {
          toast.error(response_CourseReview_data.message);
          localStorage.removeItem("jwt");
          localStorage.removeItem("user_id");
          if (router.pathname.startsWith("/private")) {
            router.push("/");
          } else {
            location.reload();
          }
        }
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  const formatDate = (value) => {
    const cr_date = new Date(value * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      return (format(cr_date, "MMM d, yyyy"));
    }
  };

  const handleAddReview = () => {
    // console.log("courseDetail",courseDetail)
    const isLoggedIn = userLoggedIn();
    if(isLoggedIn) {
      if(courseDetail.is_purchased == 1) {
        setReviewModalShow(true);
      }
      else{
        showErrorToast("You didn't purchase this course")
      }
    }
    else {
      setModalShow(true)
    }
  }

  const handleEditReview = () => {
    const isLoggedIn = userLoggedIn()
    if(isLoggedIn) {
      if(courseDetail.is_purchased == 1) {
        setReviewModalShow(true);
      }
      else{
        showErrorToast("You didn't purchase this course")
      }
    }
    else {
      setModalShow(true)
    }
  }

  const fetchCourseDetail = async () => {
    try{
      const token = get_token();
      const formData = {
        course_id: courseDetail.id,
        page: 1,
        parent_id: courseCombo ? "" : courseDetail.id,
      };
      const response_getCourseDetail_service = await getCourseDetail_Service(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getCourseDetail_data = decrypt(
        response_getCourseDetail_service.data,
        token
      );
      // console.log("response_getCourseDetail_data", response_getCourseDetail_data);
      if (response_getCourseDetail_data.status) {
        // setOnlineCourseAry(response_getCourseDetail_data?.data?.course_detail);
        setAvgRating(response_getCourseDetail_data?.data?.course_detail?.avg_rating)
        // console.log("detail", response_getCourseDetail_data?.data?.tiles);
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  // console.log('rating', avgRating)

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);  // Number of full stars
    const halfStar = rating % 1 >= 0.5;    // Whether there's a half star
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);  // Remaining empty stars

    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<img key={`full-${i}`} src='/assets/images/fullStar.svg' alt='Full Star' />);
    }

    // Add half star if needed
    if (halfStar) {
      stars.push(<img key='half' src='/assets/images/halfStar.svg' alt='Half Star' />);
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<img key={`empty-${i}`} src='/assets/images/emptyStar.svg' alt='Empty Star' />);
    }

    return stars;
  };

  const getGroupedRatings = (ratings) => {
    const ratingCounts = ratings.reduce((acc, user) => {
        const roundedRating = Math.round(parseFloat(user.rating));  // Convert rating to number and round
        acc[roundedRating] = (acc[roundedRating] || 0) + 1;
        return acc;
    }, {});
    return ratingCounts;
  };

  const groupedRatings = getGroupedRatings(reviewList);

  const getRatingPercentage = (rating) => {
    const count = groupedRatings[rating] || 0; // Default to 0 if there are no ratings for that value
    return (count / reviewList.length) * 100;
  };
      
  return (
    <>
    {/* <Toaster position="top-right" reverseOrder={false} toastOptions={{duration: 1500}}/> */}
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
      
    <AddReviewModal
      show={reviewModalShow}
      onHide={() => {
        setReviewModalShow(false);
      }}
      courseID={courseID}
      editReviewData = {editReviewData}
    />
    <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
    <div className="row All_ratings p-0 m-0 mt-5">
      <div className="p-0 m-0 col-md-12 d-flex justify-content-between align-items-center">
        <h1 className="head p-0 mb-3">All Reviews</h1>
          {editReview ? <Button1 value={"Edit Review"} handleClick={handleEditReview} />
          :
          <Button1 value={"+ Add Review"} handleClick={handleAddReview} />
          }
        </div>
        <div className="p-0 m-0 ratingSection col-md-12 d-flex gap-2 align-items-center">
          <div className="total_rating">
            <h4 className="m-0 ratingOutOff">
              {avgRating ? parseFloat(avgRating).toFixed(1) : '0.0'}
            </h4>
              {/* <ReactStars
                count={5}
                value={Rating ? parseFloat(Rating) : 0}
                size={24}
                isHalf={true}
                emptyIcon={<i className="far fa-star"></i>}
                halfIcon={<i className="fa fa-star-half-alt"></i>}
                fullIcon={<i className="fa fa-star"></i>}
                activeColor="#ffd700"
                edit = {false}
              /> */}
              <div className="starImg">
                {renderStars(avgRating)}  {/*Render the stars based on avgRating */}
              </div>
              <p className='avgRateAndReview'>
                {`${avgRating ? parseFloat(avgRating).toFixed(1) : '0.0'} ratings and ${courseDetail.user_rated ? courseDetail.user_rated : '0'} reviews`}
              </p>
              
            </div>
            <div className='progressBars'>
              <p className="m-0 d-flex align-items-center gap-2">
                5 <ProgressBar now={getRatingPercentage(5)} />
              </p>
              <p className="m-0 d-flex align-items-center gap-2">
                4 <ProgressBar now={getRatingPercentage(4)} />
              </p>
              <p className="m-0 d-flex align-items-center gap-2">
                3 <ProgressBar now={getRatingPercentage(3)} />
              </p>
              <p className="m-0 d-flex align-items-center gap-2">
                2 <ProgressBar className="rateNegative" now={getRatingPercentage(2)} />
              </p>
              <p className="m-0 d-flex align-items-center gap-2">
                1 <ProgressBar className="rateNegative" now={getRatingPercentage(1)} />
              </p>
            </div>
          </div>
          <ul className="p-0 my-3 list-unstyled reviewsHeight">
          {
            reviewList.length > 0 && reviewList.map((item, index) => {
              return <li className='row py-3 m-0' key={index}>
              <div className="p-0 mb-2 d-flex gap-2 align-items-center">
                <img className='UserRateImg' src={item?.profile_picture ? item?.profile_picture : '/assets/images/profile.png'} alt='' />
                <div>
                <h4 className="mb-1 userRateTitle">{item.name}</h4>
                  <div className="d-flex m-0 freeCourserate">
                    <p className="m-0">
                      <span className="freeRating">
                        <IoStar /> {parseFloat(item.rating).toFixed(1)}
                      </span>
                    </p>
                    <p className="m-0 freeCourseReview">
                      {formatDate(item.creation_time)}
                    </p>
                  </div>
                </div>
              </div>
              <p className='m-0'>{item.message}</p>
            </li>
            }) 
          }
          </ul>
        </div>
    </>
  )
}

const msg = "You are already logged in with some other devices, So you are logged out from this device. 9";

export default CourseReview