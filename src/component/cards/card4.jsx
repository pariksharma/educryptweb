import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IoStar } from "react-icons/io5";
import Button1 from "../buttons/button1/button1";
import Button2 from "../buttons/button2/button2";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { MdOutlineCalendarMonth } from "react-icons/md";
import { format } from "date-fns";
import ExtendValiditymodal from "../modal/extendValiditymodal";
import { getFPaymentService, getPayGatewayService } from "@/services";
import { comboDetail, decrypt, encrypt, get_token, userLoggedIn } from "@/utils/helpers";
import Script from "next/script";
import ThankyouModal from "../modal/thankyouModal";
import LoginModal from "../modal/loginModal";

const Card4 = ({ value, titleName, handleDetail, titleId, setGetCourse, handleAddToMyCourse }) => {
  const [validityShow, setValidityShow] = useState(false);
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [thankYouModalShow, setThankYouModalShow] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const router = useRouter();
  const token = get_token();

  // console.log('detail', value)

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false);
      }, 1500);
    }
  }, [isToasterOpen]);

  useEffect(() => {
    if (thankYouModalShow) {
      setTimeout(() => {
        setThankYouModalShow(false);
      }, 3000);
    }
  }, [thankYouModalShow]);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const showErrorToast = (toastMsg) => {
    if (!isToasterOpen) {
      setIsToasterOpen(true);
      toast.error(toastMsg, {
        // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
        autoClose: 1500,
      });
    }
  };

  const showSuccessToast = (toastMsg) => {
    if (!isToasterOpen) {
      setIsToasterOpen(true);
      toast.success(toastMsg, {
        // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
        autoClose: 1500,
      });
    }
  };

  const formatDate = (date) => {
    const cr_date = new Date(date * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      return format(cr_date, "d MMM, yyyy");
    }
  };

  const remainingDays = (date) => {
    const cr_date = new Date(date * 1000);
    const currentDate = new Date();
    const targetDate = new Date(format(cr_date, "yyyy-MM-dd"));
    const differenceInMilliseconds = targetDate - currentDate;
    const daysRemaining = Math.ceil(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );
    return daysRemaining;
  };

  const handleExtendValidity = () => {
    // const isLoggedIn = userLoggedIn();
    // if(!isLoggedIn) {

    // }
    setValidityShow(true);
    // console.log("extend", value);
  };

  const handleSelectedValidity = (selectedPack) => {
    // console.log("Clicked ==========12345", selectedPack);
    setValidityShow(false);
    handlePayNow(selectedPack);
  };

  const handlePayNow = async (item, installment) => {
    try {
      // console.log("EMi installments", item);
      // console.log("pay now", item);
      const isLoggedIn = localStorage.getItem("jwt");
      if (isLoggedIn) {
        const formData = {};
        const response_getPayGateway_service = await getPayGatewayService(
          encrypt(JSON.stringify(formData), token)
        );
        const response_getPayGateway_data = decrypt(
          response_getPayGateway_service.data,
          token
        );
        const payName =
          response_getPayGateway_data?.data?.rzp?.status == 1
            ? response_getPayGateway_data?.data?.rzp?.meta_name
            : response_getPayGateway_data?.data?.easebuzz?.meta_name;
        if (response_getPayGateway_data.status) {
          const razoparPayData = response_getPayGateway_data?.data?.rzp;
          const formDataPayment = {
            course_id: item.course_id,
            extender_id: item.id,
            pay_via: payName == "RZP_DETAIL" ? 3 : 9,
            txn_id: value.txn_id,
            type: "3",
          };
          // console.log('option', formDataPayment)
          const response_getFPayment_service = await getFPaymentService(
            encrypt(JSON.stringify(formDataPayment), token)
          );
          // console.log(
          //   "response_getFPayment_service",
          //   response_getFPayment_service
          // );
          const response_getFPayment_data = decrypt(
            response_getFPayment_service.data,
            token
          );
          let key = response_getPayGateway_data?.data?.easebuzz?.mid;
          // console.log("response_getFPayment_data", response_getFPayment_data);
          if (response_getFPayment_data.status) {
            // console.log('price', item.price)
            if (response_getPayGateway_data?.data?.rzp?.status == 1) {
              try {
                const options = {
                  key: razoparPayData.key, // Again, for client-side
                  amount: parseFloat(item.price).toFixed(2) * 100,
                  // amount: 100 * 100,
                  currency: "INR",
                  method: {
                    emi: false,
                  },
                  // Other options as needed
                  handler: function (response) {
                    // Payment was successful
                    const orderDetails = {
                      txnid: response_getFPayment_data.data.pre_transaction_id,
                      payid: response.razorpay_payment_id,
                      pay_via: 3,
                    };
                    // console.log("Payment ID:", response.razorpay_payment_id);
                    // console.log("Order ID:", response.razorpay_order_id);
                    // console.log("Signature:", response.razorpay_signature);
                    let status = 1;
                    paymentConfirmation(status, orderDetails, item.course_id);
                  },
                };
                const instance = new Razorpay(options);
                // console.log("option", options);
                instance.on("payment.failed", function (response) {
                  toast.error("Payment failed!");
                });
                instance.open();
              } catch (error) {
                toast.error(error);
              }
            } else if (
              response_getPayGateway_data?.data?.easebuzz?.status == 1
            ) {
              paymentGateWay(
                response_getFPayment_data?.data?.txnToken,
                key,
                item.course_id
              );
            }
          } else {
            toast.error(response_getFPayment_data.message);
            if (
              response_getFPayment_data.message ==
              "You are already logged in with some other devices, So you are logged out from this device. 9"
            ) {
              localStorage.removeItem("jwt");
              localStorage.removeItem("user_id");
              router.pathname.startsWith("/private")
                ? router.push("/")
                : location.reload();
            }
          }
        } else {
          if (response_getPayGateway_data.status) {
            toast.error("We're facing some technical issue");
          } else toast.error(response_getPayGateway_data.false);
        }
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  //////////////////////////////// EaseBuzz Payment Service ////////////////////////////////////////////////

  const paymentGateWay = async (acc_key, key) => {
    try {
      var easebuzzCheckout = new window.EasebuzzCheckout(
        key,
        process.env.NEXT_PUBLIC_TYPE
      );
      var options = {
        access_key: acc_key, // access key received via Initiate Payment

        disable_payment_mode: "emi",
        onResponse: (response) => {
          // console.log(response);
          // post_transaction_id
          const order_details = {
            txnid: response.txnid,
            payid: response.easepayid,
            pay_via: 9,
          };
          let status = response.status == "success" ? 1 : 0;
          // console.log("responsey8778", response);
          // loading(true);
          paymentConfirmation(status, order_details);
          //   const formData = new FormData();
          //   formData.append('type', 2);
          //   formData.append('course_id', courseId);
          //   formData.append('course_price', stringToFloat(detail.mrp));
          //   formData.append('tax',stringToFloat(detail.tax));
          //   formData.append('pay_via', 9);
          //   formData.append('coupon_applied', 0);
          //   formData.append('pre_transaction_id',response.txnid);
          //   formData.append('transaction_status', status);
          //   formData.append('post_transaction_id', response.easepayid);
          //    getFPaymentService(formData).then(res =>{
          //     let {data, status, message} = resHandler(res);
          //   //  status && console.log(data)
          //    status && sendDataToParent(order_details);
          //    loading(false)

          // }).catch(err =>{
          //   console.log(err)
          // })
        },
        theme: "#123456", // color hex
      };

      await easebuzzCheckout.initiatePayment(options);
      // console.log(JSON.stringify(selectedPaymentGateway))
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  //////////////////////////////// Payment Confirmation Service ////////////////////////////////////////////////

  const paymentConfirmation = async (status, data, id) => {
    try {
      // console.log("confirm", data);
      const formDataConfirm = {
        type: 4,
        course_id: id,
        pre_transaction_id: data.txnid,
        transaction_status: status,
        post_transaction_id: data.payid,
        txn_id: value.txn_id,
      };
      // console.log("formDataConfirm", formDataConfirm);
      const response_ConfirmPayment_service = await getFPaymentService(
        encrypt(JSON.stringify(formDataConfirm), token)
      );
      const response_ConfirmPayment_data = decrypt(
        response_ConfirmPayment_service.data,
        token
      );
      // console.log("response_ConfirmPayment_data", response_ConfirmPayment_data);
      if (response_ConfirmPayment_data.status) {
        // toast.success(response_ConfirmPayment_data.message);
        setThankYouModalShow(true);
        setGetCourse(data.payid);
        // fetchMyOrders();
        //   if (value?.cat_type == 1) {
        //     router.push("/private/myProfile/ourCourse");
        //   } else {
        //     router.push("/private/myProfile/MyCourse");
        //   }
        // } else {
        //   toast.error(response_ConfirmPayment_data.message);
      } else {
        if (
          response_ConfirmPayment_data.message !=
          "The transaction_status field must be one of: 1,2."
        ) {
          // console.log("cancelled");
          showErrorToast(
            "Transaction Cancelled, Your payment was canceled. Please try again if needed."
          );
        } else {
          showErrorToast(
            "Transaction Failed, Your payment couldn’t be processed."
          );
        }
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  const handleBuy = () => {
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      const currentPath = router.asPath;
      localStorage.setItem("redirectAfterLogin", currentPath);
      localStorage.setItem("previousTab", router.pathname);
      router.push(
        `/view-courses/course-order/${
          titleName + ":" + value.id + "&" + value.combo_course_ids
        }`
      );
    } else {
      setModalShow(true);
    }
  };

  return (
    <>
      <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
      <ThankyouModal
        show={thankYouModalShow}
        onHide={() => setThankYouModalShow(false)}
      />
      <ExtendValiditymodal
        show={validityShow}
        onHide={() => {
          setValidityShow(false);
        }}
        handleSelectedValidity={handleSelectedValidity}
        courseDetail={value}
        // editReviewData = {editReviewData}
      />
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <Script src="https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/v2.0.0/easebuzz-checkout-v2.min.js" />
      {/* <Toaster position="top-right" reverseOrder={false} /> */}

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


      <div
        className={`card border-0 mb-3 ${
          titleName != "detail"
            ? "shadow b-radius course_card"
            : "shadow-lg mb-3 detail-rightCard m-3"
        }`}
      >
        {value.mrp == 0 && <p className="m-0 course-badge">FREE</p>}
        <div className="d-flex justify-content-center">
          {/* {console.log("value4235", value)} */}
          <img
            style={{ borderRadius: "10px" }}
            src={
              value?.cat_type == 1
                ? (value?.cover_image
                  ? value?.cover_image
                  : "/assets/images/noImage.jfif")
                : (value.desc_header_image
                ? value.desc_header_image
                : "/assets/images/noImage.jfif")
            }
            className={` ${
              value?.cat_type == 1 ? "coverImg" : "bookStoreImg flex-fill"
            }`}
            alt="..."
          />
        </div>
        {/* <div className="m-0 free-badge">FREE</div> */}
        <div className="card-body pt-3 px-0 pb-0">
          <h6 className="mb-2 slideTitle">{value?.title}</h6>
          {/* <div className="m-0 clearfix">
                    <div className="countTitle"><i className="fab fa-youtube"></i> 120 videos</div>
                    <div className="countTitle ms-3"><i className="far fa-file-alt"></i> 40 PDF's</div>
                </div> */}
          {titleName == "detail" ? (
            <>
              <div className="courserate">
                <div className="d-flex align-items-center">
                  <span className="rating">
                    <IoStar />{" "}
                    {value.avg_rating
                      ? parseFloat(value.avg_rating).toFixed(1)
                      : "0.00"}
                  </span>
                  <p className="m-0 review">
                    {value.user_rated ? value.user_rated : 0} reviews
                  </p>
                </div>
                {value?.mrp == 0 && <p className="m-0 freeStripe">Free</p>}
              </div>
              {value?.cat_type != 1 && value.validity && (
                <p className="my-2 d-flex align-items-center validity">
                  <img
                    className="calendarDate2 me-1"
                    src="/assets/images/calendarDate2.svg"
                    alt=""
                  />
                  Validity:
                  <span className="ms-2 valid_date">{`${value.validity}`}</span>
                </p>
              )}
            </>
          ) : (
            <>
              <div className="w-100 mt-2">
                {/* {console.log('value', value)} */}
                {value.expiry_date && (
                  <p className="m-0 mb-1 gap-1 d-flex align-items-center validity">
                    <img
                      className="calendarImg"
                      src="/assets/images/calendarImg.svg"
                      alt=""
                    />
                    {/* {console.log('value', value)} */}
                    Validity:
                    <span className="valid_date">{`${formatDate(
                      value.expiry_date
                    )}`}</span>
                  </p>
                )}
                <div className="d-flex align-items-center justify-content-between">
                  {value.expiry_date && (
                    <p className="m-0 gap-1 d-flex align-items-center validity">
                      <img
                        className="calendarImg"
                        src="/assets/images/calendarImg.svg"
                        alt=""
                      />
                      <span className="remaining_date">{`Remaining ${remainingDays(
                        value.expiry_date
                      )} Days`}</span>
                    </p>
                  )}
                  {/* {titleId != "PAID COURSES"  && (
                  <p className="m-0 freeStripe">Free</p>
                )} */}
                  {value.mrp == 0 && <p className="m-0 freeStripe">Free</p>}
                </div>
              </div>
              <hr className="dotted-divider" />
            </>
          )}
          {!comboDetail(router.asPath) && 
            <>
              {value.is_purchased == 0 && value?.mrp != 0 && (
                <>
                  {/* <div className="coursePriceContainer"> */}
                  <div className="coursePrice gap-2 d-flex align-items-center pb-1 m-0">
                    <div className="m-0 d-flex align-items-center detail_C_Price">
                      {/* <FaRupeeSign className="rupeeSign" /> */}₹
                      {/* <span className='costPrice'> */}
                      {value.is_gst == 0
                        ? Number(value.mrp) + Number(value.tax)
                        : value.mrp}
                      {/* </span> */}
                    </div>
                    {Number(value.mrp) + Number(value.tax) != value.course_sp && (
                      <>
                        <p className="m-0 Card-OffPrice">
                          <del>
                            {/* <FaRupeeSign className="rupeeSign2" /> */}₹
                            {value?.course_sp}
                          </del>
                        </p>
                        <p className="m-0 offPricePercentage">
                          {value?.discount && `(${value?.discount}% Off)`}
                        </p>
                      </>
                    )}
                  </div>
                </>
              )}
              {/* {console.log('value', value)} */}
              {(value.is_purchased != 0 ? (
                <>
                  {!router.pathname.startsWith("/private/myProfile/detail") &&
                  ((!router.pathname.startsWith("/private/myProfile/detail") &&
                    value.mrp != 0) ||
                    titleName != "detail") ? (
                      <div className="myCourseBtn d-flex flex-wrap flex-lg-nowrap gap-2">
                        <Button1
                          value={
                            value?.is_purchased == 1
                              ? "View Content"
                              : value?.purchase_date != ""
                                ? "View Content"
                                : "View Detail"
                          }
                          data={true}
                          handleClick={() => handleDetail(value)}
                        />
                        {value?.prices?.length > 0 && (
                          <Button2
                            value="Extend Validity"
                            data={true}
                            handleClick={() => handleExtendValidity(value)}
                          />
                        )}
                      </div>
                    ) : (
                    <div className="myCourseBtn d-flex flex-wrap flex-lg-nowrap gap-2">
                      <Button1 widthFull={true} value="Purchased" />
                    </div>
                  )}
                </>
              ) : (
                value.mrp != '0' ? 
                  <div className="myCourseBtn d-flex flex-wrap flex-lg-nowrap gap-2">
                    <Button1 widthFull={true} value={"Buy Now"} handleClick={handleBuy} />
                  </div>
                  :
                  <div className="myCourseBtn d-flex flex-wrap flex-lg-nowrap gap-2">
                    <Button1 widthFull={true} value={"Add to My Course"} handleClick={handleAddToMyCourse} />
                  </div>
              ))}
            </>
          }
        </div>
      </div>
    </>
  );
};

export default Card4;
