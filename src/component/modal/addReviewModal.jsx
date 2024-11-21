import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Button1 from "../buttons/button1/button1";
import ReactStars from "react-rating-stars-component";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import { postCourseReviewService } from "@/services";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { all_review } from "@/store/sliceContainer/masterContentSlice";

const AddReviewModal = (props) => {
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false);
      }, 1500);
    }
  }, [isToasterOpen]);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    if (props.editReviewData) {
      setReview(props?.editReviewData?.message);
    }
  }, [props.editReviewData]);

  const handleReview = () => {
    // console.log("feedback", review);
    handlePostReview();
  };

  const ratingChanged = (newRating) => {
    // console.log(newRating);
    setRating(newRating);
  };

  // const showErrorToast = (toastMsg) => {
  //   if (!isToasterOpen) {
  //     setIsToasterOpen(true);
  //     toast.error(toastMsg, {
  //       // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
  //       autoClose: 1500,
  //     });
  //   }
  // };

  // const showSuccessToast = (toastMsg) => {
  //   if (!isToasterOpen) {
  //     setIsToasterOpen(true);
  //     toast.success(toastMsg, {
  //       // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
  //       autoClose: 1500,
  //     });
  //   }
  // };

  const handlePostReview = async () => {
    try{
      const token = get_token();
      const formData = {
        message: review,
        rating: rating,
        course_id: props.courseID,
      };
      const response_postReview_service = await postCourseReviewService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_postReview_data = decrypt(
        response_postReview_service.data,
        token
      );
      if (response_postReview_data.status) {
        // showSuccessToast(response_postReview_data.message);
        toast.success(response_postReview_data.message, {
          // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
          autoClose: 1500,
        });
        props.onHide();
        dispatch(all_review(review));
      } else if (response_postReview_data.message == msg) {
        // showErrorToast(response_postReview_data.message);
        toast.error(response_postReview_data.message, {
          // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
          autoClose: 1500,
        });
        localStorage.removeItem("jwt");
        localStorage.removeItem("user_id");
        // location.href("/")
        if (router.pathname.startsWith("/private")) {
          router.push("/");
        } else location.reload();
      } else {
        // showErrorToast(response_postReview_data.message);
        toast.error(response_postReview_data.message, {
          // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };
  return (
    <Modal
      {...props}
      size={"sm"}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="reviewModal"
    >
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
      <div className="modal-body rateAndreviewModal">
        <h4 className="m-0 r_title">Review</h4>
        <p className="m-0 r_text">Please rate your experience below</p>
        <div className="d-flex justify-content-center">
          <ReactStars
            classNames="d-flex gap-3"
            value={props?.editReviewData ? Number(props?.editReviewData?.rating) : 0}
            count={5}
            onChange={ratingChanged}
            size={24}
            isHalf={true}
            emptyIcon={<i className="far fa-star"></i>}
            halfIcon={<i className="fa fa-star-half-alt"></i>}
            fullIcon={<i className="fa fa-star"></i>}
            activeColor="#ffd700"
          />
        </div>
        <div className="mt-3">
          <p className="m-0 textAreaTitle">Write review</p>
          <textarea
            value={review}
            className="review_textarea"
            type="text"
            placeholder="My Review..."
            onChange={(e) => setReview(e.target.value)}
          />
          <div className="mt-2 reviewBtn">
            <Button1 value={"Submit Review"} handleClick={handleReview} />
          </div>
        </div>
      </div>
    </Modal>
  );
};

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default AddReviewModal;
