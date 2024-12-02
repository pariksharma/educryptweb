import React, { useState, useEffect } from "react";
import Header from "@/component/header/header";
import { useRouter } from "next/router";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaRupeeSign } from "react-icons/fa";
import Button1 from "@/component/buttons/button1/button1";
import Button2 from "@/component/buttons/button2/button2";
import {
  get_token,
  encrypt,
  decrypt,
  isValidData,
  userLoggedIn,
} from "@/utils/helpers";
import {
  couponVerifyService,
  deleteAddressService,
  districtListService,
  freeTransactionService,
  getCoupon_service,
  getCourseDetail_Service,
  getFPaymentService,
  getPayGatewayService,
  getUserAddressService,
  saveAddressService,
  stateListService,
} from "@/services";
import Script from "next/script";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginModal from "@/component/modal/loginModal";
import "bootstrap-icons/font/bootstrap-icons.css";
import CouponModal from "@/component/modal/couponModal";
import Accordion from "react-bootstrap/Accordion";
import { useSelector } from "react-redux";
import Select from "react-select";
import ThankyouModal from "@/component/modal/thankyouModal";
import Link from "next/link";
import Head from 'next/head';


const CourseOrderID = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [couponModalShow, setCouponModalShow] = useState(false);
  const [thankYouModalShow, setThankYouModalShow] = useState(false);
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [isAddressShow, setIsAddressShow] = useState(false);
  const [isAddressSave, setIsAddressSave] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(false);
  const [isPrivateTab, setIsPrivateTab] = useState(false);
  const [showError, setShowError] = useState(false);
  const [toggleTerms, setToggleTerms] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [preFillCouponList, setPreFillCouponList] = useState([]);
  const [selfFillCouponList, setSelfFillCouponList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [districtOption, setDistrictOption] = useState([]);
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [couponList, setCouponList] = useState([]);
  const [EMI, setEMI] = useState([]);
  const [savedAddress, setSavedAddress] = useState([]);
  const [isChecked, setIsChecked] = useState("");
  const [accordianId, setAccordianId] = useState(0);
  const [addressId, setAddressId] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [key, setKey] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [payment_mode, setPayment_mode] = useState("");
  const [installment, setInstallment] = useState("");
  const [courseData, setCourseData] = useState("");
  const [coupon, setCoupon] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [id, setId] = useState("");
  const [titleName, setTitleName] = useState("");
  const [courseCombo, setCourseCombo] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    mobile: "",
    address: "",
    landmark: "",
    state: "",
    district: "",
    pincode: "",
    country: "+91-",
  });

  const router = useRouter();
  const { courseOrderID, IsBuy } = router.query;
  // console.log("router.query", router.query)
  // const id = courseOrderID.slice(courseOrderID.indexOf(':') +1, courseOrderID.length)
  // const titleName = courseOrderID.slice(0, courseOrderID.indexOf(':'))
  const token = get_token();
  const versionData = useSelector((state) => state.allCategory?.versionData);
  // console.log("versionData456788", versionData);

  useEffect(() => {
    setToggleTerms(false);
    if (courseOrderID) {
      fetchCouponService(
        courseOrderID?.slice(
          courseOrderID.indexOf(":") + 1,
          courseOrderID.indexOf("&")
        )
      );
      fetchCourseDetail(
        courseOrderID?.slice(
          courseOrderID.indexOf(":") + 1,
          courseOrderID.indexOf("&")
        )
      );
      setId(
        courseOrderID?.slice(
          courseOrderID.indexOf(":") + 1,
          courseOrderID.indexOf("&")
        )
      );
      setTitleName(courseOrderID?.slice(0, courseOrderID.indexOf(":")));
      setCourseCombo(
        courseOrderID?.slice(
          courseOrderID.indexOf("&") + 1,
          courseOrderID.length
        )
      );
    }
  }, [courseOrderID]);

  useEffect(() => {
    if (isAddressShow) {
      fetchStateList();
    }
  }, [isAddressShow]);

  useEffect(() => {
    if (savedAddress?.length == 0) {
      setIsAddressSave(false);
    } else {
      setIsAddressSave(true);
    }
  }, [savedAddress]);

  useEffect(() => {
    const isPrivate = localStorage.getItem("previousTab");
    const show = isPrivate?.substring(0, isPrivate?.indexOf("private"));
    setShowError(false);
    setIsChecked('')
    if (show) {
      setIsPrivateTab(true);
    } else {
      setIsPrivateTab(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    if (courseData?.cat_type == 1) {
      setIsAddressShow(true);
    }
  }, [courseData]);

  useEffect(() => {
    // console.log(preFillCouponList);
    if (preFillCouponList && preFillCouponList.length == 1) {
      handleApplyCoupon2(preFillCouponList[0]?.coupon?.coupon_tilte);
    }
  }, [preFillCouponList]);

  useEffect(() => {
    const option = stateList.map((state) => ({
      value: state.id, // Store the id as value
      label: state.name,
    }));
    setStateOption(option);
  }, [stateList]);

  useEffect(() => {
    const option = districtList.map((district) => ({
      value: district.id, // Store the id as value
      label: district.name,
    }));
    setDistrictOption(option);
  }, [districtList]);

  useEffect(() => {
    if (isAddressShow) {
      // console.log('stateId', stateOption.find(stateOption => stateOption.label == userData.state)?.value)
      fetchDistrictList(
        stateId
          ? stateId
          : stateOption.find(
            (stateOption) => stateOption.label == userData.state
          )?.value
      );
    }
  }, [stateId, userData.state]);

  useEffect(() => {
    if (EMI) {
      setKey(EMI[0]?.name);
    }
  }, [EMI]);

  useEffect(() => {
    if (payment_mode == 0) {
      setPaymentMode("One Time Payment");
    } else if (payment_mode == 1) {
      setPaymentMode("EMI Payment");
      setInstallment(EMI[0]);
    } else if (payment_mode == 2) {
      setPaymentMode("One Time Payment");
      setInstallment(EMI[0]);
    }
  }, [payment_mode]);

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false);
      }, 1500);
    }
  }, [isToasterOpen]);

  useEffect(() => {
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      fetchUserAddress();
    }
  }, []);

  useEffect(() => {
    if (thankYouModalShow) {
      setTimeout(() => {
        setThankYouModalShow(false);
      }, 3000);
    }
  }, [thankYouModalShow]);



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

  //////////////////////////////// fetch Coupon Service ////////////////////////////////////////////////

  const fetchCouponService = async (id) => {
    try {
      const formData = {
        course_id: id,
      };
      const response_getCoupon_service = await getCoupon_service(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getCouponService_data = decrypt(
        response_getCoupon_service.data,
        token
      );
      if (response_getCouponService_data.status) {
        setCouponList(response_getCouponService_data.data);
        setPreFillCouponList(
          response_getCouponService_data.data.filter(
            (item) => item?.coupon?.target_type == 2
          )
        );
        setSelfFillCouponList(
          response_getCouponService_data.data.filter(
            (item) => item?.coupon?.target_type == 1
          )
        );
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  //////////////////////////////// fetch Course Detail Service ////////////////////////////////////////////////

  const fetchCourseDetail = async (id) => {
    try {
      const formData = {
        course_id: id,
        page: 1,
      };
      const response_getCourseDetail_service = await getCourseDetail_Service(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getCourseDetail_data = decrypt(
        response_getCourseDetail_service.data,
        token
      );
      // console.log(response_getCourseDetail_data);
      if (response_getCourseDetail_data.status) {
        setCourseData(response_getCourseDetail_data.data.course_detail);
        setEMI(response_getCourseDetail_data.data?.instalment?.installment);
        setPayment_mode(
          response_getCourseDetail_data.data?.instalment?.payment_mode
        );
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  const totalAmount = () => {
    if (couponData) {
      return Number(couponData.mrp) + Number(couponData.tax);
    } else {
      return Number(courseData.mrp) + Number(courseData.tax);
    }
  };

  //////////////////////////////// Handle Payment Service ////////////////////////////////////////////////

  const handleBookPayment = () => {
    // console.log('userData', userData)
    if (
      !userData.name &&
      !userData.mobile &&
      !userData.address &&
      !userData.state &&
      !userData.district &&
      !userData.pincode
    ) {
      showErrorToast("Please Add your address");
    } else {
      handlePayment();
    }
  };

  const handleAddToMyCourse = async () => {
    try {
      if (userLoggedIn()) {
        const formData = {
          course_id: id,
          parent_id:0,
          coupon_applied:couponData?.coupon?.id 
        };
        const response = await freeTransactionService(encrypt(JSON.stringify(formData), token));
        const data = decrypt(response.data, token);
        console.log('data', data)
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

  const handlePayment = async () => {
    try {
      const isLoggedIn = localStorage.getItem("jwt");
      if (isLoggedIn) {
        if (toggleTerms) {
          const formData = {};
          const response_getPayGateway_service = await getPayGatewayService(
            encrypt(JSON.stringify(formData), token)
          );
          const response_getPayGateway_data = decrypt(
            response_getPayGateway_service.data,
            token
          );
          console.log(
            "response_getPayGateway_data",
            response_getPayGateway_data
          );
          const payName =
            response_getPayGateway_data?.data?.rzp?.status == 1
              ? response_getPayGateway_data?.data?.rzp?.meta_name
              : response_getPayGateway_data?.data?.easebuzz?.meta_name;
              console.log('couponData', couponData?.mrp)
          if(couponData?.mrp == 0){
            handleAddToMyCourse()
          }
          else {
            if (response_getPayGateway_data.status) {
            const razoparPayData = response_getPayGateway_data?.data?.rzp;

            const addressPlaced = {
              address: userData.address,
              city: userData.district,
              district: userData.district,
              isChecked: "1",
              name: userData.name,
              orderNotes: "",
              pincode: userData.pincode,
              state: userData.state,
              mobile: userData.country + userData.mobile,
              landmark: userData.landmark,
            };

            console.log('couponData', couponData);

            const formDataPayment1 = {
              coupon_applied: couponData ? couponData?.coupon?.id : 0,
              course_id: id,
              // course_price: parseFloat(courseData.mrp).toFixed(2),
              course_price: couponData ? parseFloat(couponData.mrp).toFixed(2) : parseFloat(courseData.mrp).toFixed(2),
              tax: couponData ? parseFloat(couponData.tax).toFixed(2) : parseFloat(courseData.tax).toFixed(2),
              delivery_charge: courseData.delivery_charge
                ? courseData.delivery_charge
                : 0,
              pay_via: payName == "RZP_DETAIL" ? 3 : 9,
              // tax: parseFloat(courseData.tax).toFixed(2),
              type: 1,
              temp: 2,
              address: isAddressShow ? JSON.stringify(addressPlaced) : "",
            };

            const formDataPayment2 = {
              coupon_applied: 0,
              course_id: id,
              course_price: parseFloat(
                installment && installment?.amount_description?.payment[0]
              ).toFixed(2),
              delivery_charge: courseData.delivery_charge
                ? courseData.delivery_charge
                : 0,
              pay_via: payName == "RZP_DETAIL" ? 3 : 9,
              //quantity:1
              tax: parseFloat(
                installment && installment?.amount_description?.tax[0]
              ).toFixed(2),
              type: 1,
              //temp: 2
              subscription_code: 0,
              plan_id: installment && installment?.id,
              payment_meta: installment && JSON.stringify(installment),
              payment_mode: "1",
              address: isAddressShow ? JSON.stringify(addressPlaced) : "",
            };

            const formDataPayment =
              paymentMode == "EMI Payment"
                ? formDataPayment2
                : formDataPayment1;

            console.log("formDataPayment", formDataPayment);
            const response_getFPayment_service = await getFPaymentService(
              encrypt(JSON.stringify(formDataPayment), token)
            );
            const response_getFPayment_data = decrypt(
              response_getFPayment_service.data,
              token
            );
            let key = response_getPayGateway_data?.data?.easebuzz?.mid;
            // console.log('formDataPayment', formDataPayment)
            console.log("response_getFPayment_data", response_getFPayment_data);
            if (response_getFPayment_data.status) {
              if (response_getPayGateway_data?.data?.rzp?.status == 1) {
                try {
                  const options = {
                    key: razoparPayData.key, // Again, for client-side
                    amount:
                      paymentMode == "EMI Payment"
                        ? parseFloat(
                          installment &&
                          installment?.amount_description?.total_amount[0]
                        ).toFixed(2) * 100
                        : (couponData
                          ? totalAmount()
                          : parseFloat(totalAmount()).toFixed(2)) * 100,
                    currency: "INR",
                    prefill: {
                      // name: "Customer Name",
                      // email: "customer.email@example.com",
                      // Remove contact field or set it to an empty string
                      contact: "",
                    },
                    method: {
                      emi: false,
                    },
                    // Other options as needed
                    handler: function (response) {
                      // Payment was successful
                      const orderDetails = {
                        txnid:
                          response_getFPayment_data.data.pre_transaction_id,
                        payid: response.razorpay_payment_id,
                        pay_via: 3,
                      };
                      // console.log("Payment ID:", response.razorpay_payment_id);
                      // console.log("Order ID:", response.razorpay_order_id);
                      // console.log("Signature:", response.razorpay_signature);
                      let status = 1;
                      paymentConfirmation(status, orderDetails);
                    },
                  };

                  const instance = new Razorpay(options);
                  instance.on("payment.failed", function (response) {
                    showErrorToast("Payment failed!");
                  });
                  instance.open();
                } catch (error) {
                  showErrorToast(error);
                }
              } else if (
                response_getPayGateway_data?.data?.easebuzz?.status == 1
              ) {
                paymentGateWay(response_getFPayment_data?.data?.txnToken, key);
              }
            } else {
              showErrorToast(response_getFPayment_data.message);
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
                showErrorToast("We're facing some technical issue");
              } else showErrorToast(response_getPayGateway_data.false);
            }
          }
        } else {
          showErrorToast(
            "Before making the payment, Please, Accept terms and condition"
          );
        }
      } else {
        setModalShow(true);
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

  const paymentConfirmation = async (status, data) => {
    try {
      // console.log("datay8687", status);
      const formDataConfirm = {
        type: 2,
        course_id: id,
        pre_transaction_id: data.txnid,
        transaction_status: status,
        post_transaction_id: data.payid,
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
        // showSuccessToast(response_ConfirmPayment_data.message);
        setThankYouModalShow(true);
        if (courseData?.cat_type == 1) {
          router.push("/private/myProfile/ourCourse");
        } else {
          router.push("/private/myProfile/myCourse");
        }
      } else {
        if (
          response_ConfirmPayment_data.message !=
          "The transaction_status field must be one of: 1,2."
        ) {
          // showErrorToast(response_ConfirmPayment_data.message);
          showErrorToast(
            "Transaction Failed, Your payment couldn’t be processed."
          );
        } else {
          showErrorToast(
            "Transaction Cancelled, Your payment was canceled. Please try again if needed."
          );
        }
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  //////////////////////////////// Apply Coupon Service ////////////////////////////////////////////////

  const handleApplyCoupon = async () => {
    try {
      if (coupon) {
        setIsToasterOpen(true);
        const formData = {
          coupon_code: coupon && coupon,
          course_id: id,
          external_coupon: "",
        };
        const response_couponVerify_service = await couponVerifyService(
          encrypt(JSON.stringify(formData), token)
        );
        const response_couponVerify_data = decrypt(
          response_couponVerify_service.data,
          token
        );
        // console.log(response_couponVerify_data)
        if (response_couponVerify_data.status) {
          showSuccessToast(response_couponVerify_data.message);
          setCouponData(response_couponVerify_data?.data[0]);
        } else {
          showErrorToast(response_couponVerify_data.message);
        }
      } else {
        showErrorToast("Please enter coupon value");
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  //////////////////////////////// Apply prefill Coupon from popup Service ////////////////////////////////////////////////

  const handleApplyCoupon2 = async (value) => {
    try {
      setIsToasterOpen(true);
      if (value) {
        const formData = {
          coupon_code: value && value,
          course_id: id,
          external_coupon: "",
        };
        const response_couponVerify_service = await couponVerifyService(
          encrypt(JSON.stringify(formData), token)
        );
        const response_couponVerify_data = decrypt(
          response_couponVerify_service.data,
          token
        );
        // console.log("response_couponVerify_data", response_couponVerify_data);
        if (response_couponVerify_data.status) {
          showSuccessToast(response_couponVerify_data.message);
          setCouponData(response_couponVerify_data?.data[0]);
        } else {
          showErrorToast(response_couponVerify_data.message);
        }
      } else {
        showErrorToast("Please enter coupon value");
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  const handleViewCoupons = () => {
    setCouponModalShow(true);
  };

  const handleSelectedCoupon = (id) => {
    // console.log(id)
    setCoupon(id);
    handleApplyCoupon2(id);
    setCouponModalShow(false);
  };

  const handleRemoveCoupon = () => {
    setPreFillCouponList([]);
    setCouponData("");
  };

  const handleInstallments = (id, item) => {
    setInstallment(item);
    setAccordianId(id);
  };

  //////////////////////////////// fetch State List Service ////////////////////////////////////////////////

  const fetchStateList = async () => {
    try {
      const formData = {
        country_id: 101,
      };
      const response_stateList_service = await stateListService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_stateList_data = decrypt(
        response_stateList_service.data,
        token
      );
      if (response_stateList_data.status) {
        // console.log('response_stateList_data', response_stateList_data.data)
        setStateList(response_stateList_data.data);
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  //////////////////////////////// fetch District List Service ////////////////////////////////////////////////

  const fetchDistrictList = async (id) => {
    try {
      const formData = {
        state_id: id ? id : stateId,
      };
      // console.log('state_id', formData)
      const response_districtList_service = await districtListService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_districtList_data = decrypt(
        response_districtList_service.data,
        token
      );
      // console.log('response_districtList_data', response_districtList_data)
      if (response_districtList_data.status) {
        setDistrictList(response_districtList_data.data);
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  const validateIndianNumber = (number) => {
    // Regular expression for Indian mobile numbers starting with 6-9
    const mobileRegex = /^[6-9]\d{9}$/;

    return mobileRegex.test(number);
  };

  const handleInputMobile = (event) => {
    if (versionData.country == 0) {
      const newNumber = event.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
      if (
        !(
          newNumber.startsWith("0") ||
          newNumber.startsWith("1") ||
          newNumber.startsWith("2") ||
          newNumber.startsWith("3") ||
          newNumber.startsWith("4") ||
          newNumber.startsWith("5")
        ) &&
        newNumber.length < 11
      ) {
        setUserData({
          ...userData,
          mobile: newNumber,
        });
        setError(
          validateIndianNumber(newNumber) ? "" : "Invalid Indian number format"
        );
      }
    } else {
      setUserData({
        ...userData,
        mobile: e.target.value,
      });
    }
  };

  const handleInputPincode = (event) => {
    const newNumber = event.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    if (newNumber.length < 7) {
      setUserData({
        ...userData,
        pincode: newNumber,
      });
    }
  };

  const handleAddressForm = (e) => {
    // console.log(e.target.value);
    const { name, value } = e.target;
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
    setUserData({
      ...userData,
      [name]: capitalizedValue,
    });
  };

  const handleStateInForm = (selectedOption) => {
    // console.log(selectedOption);
    setStateId(selectedOption.value);
    setUserData({
      ...userData,
      state: selectedOption.label,
      district: "",
    });
  };

  const handleDistrictInForm = (selectedOption) => {
    setDistrictId(selectedOption.value);
    setUserData({
      ...userData,
      district: selectedOption.label,
    });
  };

  //////////////////////////////// handle Save Address ////////////////////////////////////////////////

  const handleSaveAddress = (e) => {
    // console.log(userData)
    e.preventDefault();
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      if (!userData.name) {
        showErrorToast("Please, Enter your name");
      } else if (!userData.mobile) {
        showErrorToast("Please, Enter your mobile number");
      } else if (userData.mobile.length != 10) {
        showErrorToast("please enter the valid mobile number");
      } else if (!userData.address) {
        showErrorToast("please enter your flat/house no.");
      } else if (!userData.state) {
        showErrorToast("Please, select your state");
      } else if (!userData.district) {
        showErrorToast("Please, select your district");
      } else if (!userData.pincode) {
        showErrorToast("Please enter the pincode");
      } else {
        handleConfirmSaveAddress();
      }
    } else {
      setModalShow(true);
    }
  };

  //////////////////////////////// Save Address Service ////////////////////////////////////////////////

  const handleConfirmSaveAddress = async () => {
    try {
      const addressPlaced = {
        address: userData.address,
        city: userData.district,
        district: userData.district,
        isChecked: "1",
        name: userData.name,
        orderNotes: "",
        pincode: userData.pincode,
        state: userData.state,
        mobile: userData.country + userData.mobile,
        landmark: userData.landmark,
      };
      const formData = {
        address: JSON.stringify(addressPlaced),
        is_default: defaultAddress ? 1 : 0,
        id: addressId ? addressId : "",
      };

      // console.log(formData);
      const response_saveAddress_service = await saveAddressService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_saveAddress_data = decrypt(
        response_saveAddress_service.data,
        token
      );
      if (response_saveAddress_data.status) {
        showSuccessToast(response_saveAddress_data.message);
        setIsAddressSave(true);
        setIsChecked(response_saveAddress_data?.data?.address);
        fetchUserAddress();
        setAddressId("");
      } else {
        if (response_saveAddress_data.message == "Address Already Exist") {
          showSuccessToast(response_saveAddress_data.message);
          setIsAddressSave(true);
        }
        else if (response_saveAddress_data.message == msg) {
          toast.error(response_saveAddress_data.message);
          setTimeout(() => {
            localStorage.removeItem("jwt");
            localStorage.removeItem("user_id");
            if (router.pathname.startsWith("/private")) {
              router.push("/");
            } else location.reload();
          }, 2000);
        }
        else {
          showErrorToast(response_saveAddress_data.message);
        }
      }
      // console.log("response_saveAddress_data", response_saveAddress_data);
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  const handleAddNewAddress = () => {
    setUserData({
      name: "",
      mobile: "",
      address: "",
      landmark: "",
      state: "",
      district: "",
      pincode: "",
      country: "+91-",
    });
    setIsAddressSave(false);
  };

  //////////////////////////////// fetch user Address Service ////////////////////////////////////////////////

  const fetchUserAddress = async () => {
    try {
      const formData = {};
      const response_getUserAddress_service = await getUserAddressService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getUserAddress_data = decrypt(
        response_getUserAddress_service.data,
        token
      );
      // console.log('address',response_getUserAddress_data )
      if (response_getUserAddress_data.status) {
        setSavedAddress(response_getUserAddress_data.data);
        const defaultAddressAry = response_getUserAddress_data.data
        if (defaultAddressAry?.length > 0) {
          defaultAddressAry.map((item) => {
            if (item?.is_default != 0) {
              setIsChecked(item.id);
              if (item.is_default == "1") {
                const defaultAddres = JSON.parse(item.address);
                setUserData({
                  name: defaultAddres.name,
                  mobile: defaultAddres.mobile,
                  address: defaultAddres.address,
                  landmark: defaultAddres.landmark,
                  state: defaultAddres.state,
                  district: defaultAddres.city,
                  pincode: defaultAddres.pincode,
                  country: "+91-",
                });
                // console.log(defaultAddres);
              }
            }
          });
        }
        setIsAddressSave(true);
      } else {
        setSavedAddress([]);
        if (response_getUserAddress_data.message == msg) {
          toast.error(response_getUserAddress_data.message);
          setTimeout(() => {
            localStorage.removeItem("jwt");
            localStorage.removeItem("user_id");
            if (router.pathname.startsWith("/private")) {
              router.push("/");
            } else location.reload();
          }, 2000);
        }
      }
      // console.log("response_getUserAddress_data", response_getUserAddress_data);
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  useEffect(() => {
    if (savedAddress?.length > 0) {
      savedAddress.map((item) => {
        if (item.is_default != 0) {
          setIsChecked(item.id);
          if (item.is_default == "1") {
            const defaultAddres = JSON.parse(item.address);
            setUserData({
              name: defaultAddres.name,
              mobile: defaultAddres.mobile,
              address: defaultAddres.address,
              landmark: defaultAddres.landmark,
              state: defaultAddres.state,
              district: defaultAddres.city,
              pincode: defaultAddres.pincode,
              country: "+91-",
            });
            // console.log(defaultAddres);
          }
        }
      });
    }
  }, [savedAddress]);
  // console.log('isChecked', savedAddress)

  const handleOptionChange = (e) => {
    setIsChecked(e.target.value);
    const selectAddress = JSON.parse(
      savedAddress.filter((item) => item.id == e.target.value)[0].address
    );
    setUserData({
      name: selectAddress.name,
      mobile: selectAddress.mobile,
      address: selectAddress.address,
      landmark: selectAddress.landmark,
      state: selectAddress.state,
      district: selectAddress.city,
      pincode: selectAddress.pincode,
      country: "+91-",
    });
  };

  const handleEditAddress = (userAddress, AddId) => {
    setIsAddressSave(false);
    // console.log("isEdit", userAddress);
    setAddressId(AddId);
    setUserData({
      name: userAddress.name,
      mobile: userAddress?.mobile?.substring(
        userAddress?.mobile.indexOf("-") + 1,
        userAddress.mobile.length
      ),
      address: userAddress.address,
      landmark: userAddress.landmark,
      state: userAddress.state,
      district: userAddress.city,
      pincode: userAddress.pincode,
      country: "+91-",
    });
  };

  // const handleConfirmEditAddress = (id) => {
  //   if(!userData.name) {
  //     showErrorToast("Please, Enter your name");
  //   }
  //   else if(!userData.mobile) {
  //     showErrorToast("Please, Enter your mobile number");
  //   }
  //   else if(userData.mobile.length != 10){
  //     showErrorToast("please enter the valid mobile number");
  //   }
  //   else if(!userData.address){
  //     showErrorToast("please enter your flat/house no.")
  //   }
  //   else if(!userData.state) {
  //     showErrorToast("Please, select your state");
  //   }
  //   else if(!userData.district) {
  //     showErrorToast("Please, select your district");
  //   }
  //   else if(!userData.pincode) {
  //     showErrorToast("Please enter the pincode");
  //   }
  //   else{
  //     handleConfirmSaveAddress(id)
  //   }
  // }

  const handleDeleteAddress = async (userAddress, id) => {
    try {
      // console.log("userAddress", userAddress);
      const formAddress = {
        state: userAddress?.state,
        city: userAddress?.city,
        pincode: userAddress?.pincode,
        address: userAddress?.address,
        name: userAddress?.name,
      };
      const formData = {
        address: JSON.stringify(formAddress),
        id: id,
      };
      const response_deleteAddress_service = await deleteAddressService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_deleteAddress_data = decrypt(
        response_deleteAddress_service.data,
        token
      );
      // console.log("response_deleteAddress_data", response_deleteAddress_data);
      if (response_deleteAddress_data.status) {
        showSuccessToast(response_deleteAddress_data.message);
        fetchUserAddress();
        setUserData({
          name: "",
          mobile: "",
          address: "",
          landmark: "",
          state: "",
          district: "",
          pincode: "",
          country: "+91-",
        });
      } else {
        showErrorToast(response_deleteAddress_data.message);
      }
    } catch (error) {
      console.log("error ", error);
    }
  };

  const handleBack = () => {
    const getbackpath = localStorage.getItem("redirectAfterLogin");
    // console.log("getbackpath", getbackpath);
    if (getbackpath) {
      router.push(getbackpath);
    } else {
      router.back();
    }
  };

  const handleBackdetails = (titleName) => {
    if (titleName == "Trending Courses") {
      router.push("/");
    } else {
      router.back();
      const back = localStorage.getItem("previousTab");
      if (back) {
        router.push(back);
      } else {
      }
    }
  };

  return (
    <>
      <Head>
        <title>{courseData.title}</title>
        <meta name={courseData?.title} content={courseData?.title} />
      </Head>
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
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <Script src="https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/v2.0.0/easebuzz-checkout-v2.min.js" />
      <Header search={"disable"} />
      <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
      <CouponModal
        show={couponModalShow}
        onHide={() => {
          setCouponModalShow(false);
        }}
        value={preFillCouponList}
        handleCouponApply={handleSelectedCoupon}
      />
      <ThankyouModal
        show={thankYouModalShow}
        onHide={() => setThankYouModalShow(false)}
      />
      <div className="container-fluid orderContainer mt-5 mb-4">
        {courseData ? (
          <>
            <div className="row mt-5">
              {!isAddressShow ? (
                <div
                  className="col-md-12 px-0 mt-1"
                  style={{ paddingTop: "10px" }}
                >
                  <nav aria-label="breadcrumb ">
                    <ol className="breadcrumb mb-0 cursor">
                      {!isPrivateTab && (
                        <li
                          className="breadcrumb-item"
                          onClick={() => router.push("/")}
                        >
                          {`Home`}
                          <i className="bi bi-chevron-right"></i>
                        </li>
                      )}
                      <li
                        className="breadcrumb-item"
                        onClick={() => handleBackdetails(titleName)}
                      >
                        {/* {console.log(titleName)} */}
                        {`${titleName}`}
                        <i className="bi bi-chevron-right"></i>
                      </li>
                      {!IsBuy && (
                        <li className="breadcrumb-item" onClick={handleBack}>
                          {`Details`}
                          <i className="bi bi-chevron-right"></i>
                        </li>
                      )}
                      <li className="breadcrumb-item active">
                        Buy Now
                        <i className="bi bi-chevron-right"></i>
                      </li>
                    </ol>
                  </nav>
                </div>
              ) : (
                <>
                  {/* <div className="col-md-12 px-0 mt-1" style={{ paddingTop: "10px" }}>
              <div className="text-centerd d-flex my-4 ">
              <p>Delivery Address</p>
              <img src="/assets/images/checkImg.png" alt="" />
              <p>Payment</p>
              </div>
            </div> */}
                </>
              )}
            </div>
            <div className="row mt-3">
              {!isAddressShow ? (
                <div className="col-sm-12 col-md-8 col-lg-8 mb-3 ">
                  <div className="card orderCard">
                    <h4 className="p-3 m-0 orderTitle">{`Order`}</h4>
                    {courseData && (
                      <table className="OrderTable" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th
                              style={{
                                width: "20px !important",
                                padding: "0px!important",
                              }}
                            ></th>
                            <th style={{ width: "68%" }}>
                              <h4 className="m-0 thead_title">PRODUCTS </h4>
                            </th>
                            <th>
                              <h4 className="m-0 thead_title">PRICE</h4>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <p className="m-0 removeIcon">
                                {/* <IoCloseCircleOutline /> */}
                              </p>
                            </td>
                            <td>
                              <div className="py-2 d-flex align-items-center">
                                <p className="tblImg">
                                  <img
                                    src={
                                      courseData?.desc_header_image
                                        ? courseData.desc_header_image
                                        : "/assets/images/noImage.jfif"
                                    }
                                  />
                                </p>
                                <p className="m-0 tbl-Title">
                                  {courseData.title}
                                </p>
                              </div>
                            </td>
                            <td style={{ padding: "5px 5px" }}>
                              <p className="m-0 price">
                                {/* <FaRupeeSign className="rupeeSign" /> */}₹
                                <span className="costPrice">
                                  {courseData.is_gst == 0
                                    ? Number(courseData.mrp) +
                                    Number(courseData.tax)
                                    : courseData.mrp}
                                  {/* {courseData.course_sp} */}
                                </span>
                              </p>
                              {Number(courseData.mrp) +
                                Number(courseData.tax) !=
                                courseData.course_sp && (
                                  <>
                                    <p className="m-0 offPrice">
                                      <del>
                                        <i className="bi bi-currency-rupee"></i>
                                        {courseData.course_sp}
                                      </del>
                                    </p>
                                  </>
                                )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ) : !isAddressSave ? (
                <>
                  <div className="col-sm-12 col-md-8 col-lg-8 mb-2">
                    <div className="gap-2 d-flex align-items-center">
                      <h4 className="m-0 d_title">Delivery Address</h4>
                      <div className="checkImgContainer">
                        <img
                          className="checkImg"
                          src="/assets/images/paycheckImg.svg"
                          alt=""
                        />
                      </div>
                      <h4 className="m-0 delpayTitle">Payment</h4>
                    </div>
                  </div>

                  <div className="col-sm-12 col-md-8 col-lg-8 mb-3 ">
                    <div className="card orderCard">
                      <h4 className="p-3 m-0 orderTitle">{`Address`}</h4>

                      <form
                        className="px-3 row ord_DeliForm"
                        onSubmit={(e) => handleSaveAddress(e)}
                        autoComplete="off"
                      >
                        <div className="col-md-6 mb-3">
                          <input
                            className="form-control"
                            type="text"
                            name="name"
                            value={userData.name}
                            placeholder="Name *"
                            onChange={handleAddressForm}
                            autoComplete="off"
                          />
                        </div>
                        <div className="col-md-6 d-flex flex-nowrap mb-3">
                          <span
                            className="bg-white input_num input-group-text"
                            id="basic-addon1"
                          >
                            <select className="Num_list">
                              <option value="">
                                <div className="gap-1 d-flex align-items-center">
                                  <img
                                    loading="lazy"
                                    className=""
                                    src="/assets/images/india.png"
                                    alt=""
                                  />
                                  {countryCode}
                                </div>
                              </option>
                              {versionData.country != 0 && (
                                <option value="">
                                  <div className="gap-1 d-flex align-items-center">
                                    <img
                                      loading="lazy"
                                      className=""
                                      src="/assets/images/india.png"
                                      alt=""
                                    />
                                    {"+81"}
                                  </div>
                                </option>
                              )}
                            </select>
                          </span>
                          <input
                            type="tel"
                            className="mobNum"
                            placeholder="Enter mobile number *"
                            value={userData.mobile}
                            onChange={handleInputMobile}
                          />
                        </div>
                        <div className="col-md-12 mb-3">
                          <textarea
                            rows="3"
                            name="address"
                            type="text"
                            className="address"
                            placeholder="Flat/House no. *"
                            value={userData.address}
                            onChange={handleAddressForm}
                          />
                        </div>
                        <div className="col-md-12 mb-3">
                          <input
                            name="landmark"
                            type="text"
                            className="landmark"
                            placeholder="landmark"
                            value={userData.landmark}
                            onChange={handleAddressForm}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <Select
                            name="state"
                            className="StateList"
                            value={
                              userData?.state
                                ? stateOption.find(
                                  (stateOption) =>
                                    stateOption.label == userData?.state
                                )
                                : stateOption.find(
                                  (stateOption) =>
                                    stateOption.value === stateId
                                ) || null
                            }
                            onChange={handleStateInForm}
                            options={stateOption && stateOption}
                            placeholder="state *"
                            isSearchable
                          />
                        </div>
                        {/* {console.log('distric', districtOption)} */}
                        <div className="col-md-6 mb-3">
                          <Select
                            name="district"
                            className="DistrictList"
                            value={
                              userData?.district
                                ? districtOption.find(
                                  (districtOption) =>
                                    districtOption.label == userData?.district
                                )
                                : districtOption.find(
                                  (districtOption) =>
                                    districtOption.value === districtId
                                ) || null
                            }
                            onChange={handleDistrictInForm}
                            options={districtOption && districtOption}
                            placeholder="district *"
                            isSearchable
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <input
                            name="pincode"
                            type="tel"
                            className="pincode"
                            placeholder="Pincode *"
                            value={userData.pincode}
                            onChange={handleInputPincode}
                          />
                        </div>
                        <div className="col-md-12 mb-4">
                          <label class="container4 d-flex align-items-center">
                            <input
                              type="checkbox"
                              onChange={() =>
                                setDefaultAddress(!defaultAddress)
                              }
                            />
                            <span class="checkmark"></span>
                            Make this my default address
                          </label>
                        </div>
                        <div className="mb-5 col-md-12 d-flex justify-content-end align-items-center">
                          <div className="addressBtn d-flex gap-2 align-items-center">
                            {/* <Button2 value={"Cancel"} /> */}
                            {/* {console.log('saveAddress', savedAddress)} */}
                            {savedAddress?.length > 0 && (
                              <button
                                className="CancelAddress"
                                onClick={() => {
                                  setIsAddressSave(true);
                                  setAddressId("");
                                }}
                              >
                                Cancel
                              </button>
                            )}
                            <Button1 value={"Save"} />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-sm-12 col-md-8 col-lg-8 mb-2">
                    <div className="gap-2 d-flex align-items-center">
                      <h4 className="m-0 d_title">Delivery Address</h4>
                      <div className="checkImgContainer">
                        <img
                          className="checkImg"
                          src="/assets/images/paycheckImg.svg"
                          alt=""
                        />
                      </div>
                      <h4 className="m-0 delpayTitle">Payment</h4>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-8 col-lg-8 mb-3 ">
                    <div className="p-3 card orderCard">
                      <div className="mb-2 addNew_Address d-flex align-items-center justify-content-between">
                        <h4 className="m-0 orderTitle">{`Select Address`}</h4>
                        <Button2
                          value={"+ Add New Address"}
                          handleClick={handleAddNewAddress}
                        />
                      </div>
                      {/* {console.log('savedAddress', savedAddress, isChecked)} */}
                      {savedAddress?.length > 0 &&
                        savedAddress.map((item, index) => {
                          let userAddress = JSON.parse(item.address);
                          // console.log('userAddress', item)
                          return (
                            <div className="card addressCard mb-2" key={index}>
                              <label>
                                <div className="mb-2 d-flex gap-1 justify-content-between align-items-center">
                                  <div className="d-flex gap-1 align-items-center">
                                    <input
                                      type="radio"
                                      value={item.id}
                                      checked={isChecked == item.id}
                                      onChange={handleOptionChange}
                                      style={{ accentColor: "orangered" }}
                                    />
                                    <h4 className="m-0 userTitle">
                                      {userAddress.name}
                                    </h4>
                                  </div>
                                  <div className="m-0 d-flex flex-nowrap">
                                    <p
                                      className="m-0 editBtn"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        handleEditAddress(userAddress, item.id)
                                      }
                                    >
                                      <i className="bi bi-pencil"></i> Edit
                                    </p>
                                    <i
                                      style={{ cursor: "pointer" }}
                                      className="ms-2 delAddress bi bi-trash3"
                                      onClick={() =>
                                        handleDeleteAddress(
                                          userAddress,
                                          item?.id
                                        )
                                      }
                                    ></i>
                                    {/* <img
                                    className="m-0 editBtn"
                                    style={{ cursor: "pointer" }}
                                    src="/assets/images/deleteLogo.svg"
                                    alt=""
                                    onClick={() =>
                                      handleDeleteAddress(userAddress, item?.id)
                                    }
                                  /> */}
                                  </div>
                                </div>
                              </label>
                              <p className="mb-2 adTitle">
                                {`${userAddress.address}, ${userAddress.district}, ${userAddress.state},${userAddress.pincode}`}
                              </p>
                              <p className="m-0 mobTitle">
                                {userAddress.mobile}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}
              <div className="col-sm-12 col-md-4 col-lg-4 mb-3 ">
                <div className="orderButton mb-2 gap-2 d-flex flex-wrap flex-xl-nowrap align-items-center">
                  {/* {console.log('payment_mode', payment_mode)} */}
                  {payment_mode && payment_mode == 0 && (
                    <Button1
                      value={"One Time Payment"}
                      handleClick={() => setPaymentMode("One Time Payment")}
                      adClass={paymentMode == "One Time Payment" ? true : false}
                    />
                  )}
                  {payment_mode && payment_mode == 1 && (
                    <Button2
                      value={"EMI Payment"}
                      handleClick={() => setPaymentMode("EMI Payment")}
                      adClass={paymentMode == "EMI Payment" ? true : false}
                    />
                  )}
                  {payment_mode && payment_mode == 2 && (
                    <>
                      <Button1
                        value={"One Time Payment"}
                        handleClick={() => setPaymentMode("One Time Payment")}
                        adClass={
                          paymentMode == "One Time Payment" ? true : false
                        }
                      />
                      <Button2
                        value={"EMI Payment"}
                        handleClick={() => setPaymentMode("EMI Payment")}
                        adClass={paymentMode == "EMI Payment" ? true : false}
                      />
                    </>
                  )}
                </div>
                {paymentMode == "One Time Payment" && (
                  // <div className="card coupon_card mt-2">
                  //   {/* <h4 className="m-0 orderTitle">Have a Coupon Code?</h4> */}
                  //   <div className="gap-2 d-flex align-items-center mt-2">
                  //     {/* {console.log('selfFillCouponList', selfFillCouponList)} */}

                  //     {/* Pre Fill Coupon when coupon have single coupon */}

                  //     {preFillCouponList.length == 1 ? (
                  //       preFillCouponList.map((item, index) => {
                  //         // console.log("item", item);
                  //         return (
                  //           <>
                  //             <span key={index}>
                  //               {item && item?.coupon?.coupon_tilte} Applied
                  //               <p>You are Saving ₹{item && item.discount}</p>
                  //             </span>
                  //             {/* <Button2
                  //           value={"Remove"}
                  //           handleClick={handleRemoveCoupon}
                  //         /> */}
                  //           </>
                  //         );
                  //       })
                  //     ) : preFillCouponList.length > 1 ? (
                  //       <>
                  //         {/* Pre Fill Coupon when coupon have multiple coupon */}
                  //         <input
                  //           className="coupon_field"
                  //           type=""
                  //           placeholder="View All Coupons"
                  //           disabled
                  //           value={coupon}
                  //           onChange={(e) => setCoupon(e.target.value)}
                  //         />
                  //         <Button2
                  //           value={"View"}
                  //           handleClick={handleViewCoupons}
                  //         />
                  //       </>
                  //     ) : (
                  //       <>
                  //         {/* Self Fill Coupon */}
                  //         <input
                  //           className="coupon_field"
                  //           type=""
                  //           placeholder="Enter Coupon Here"
                  //           onChange={(e) => setCoupon(e.target.value)}
                  //         />
                  //         <Button2
                  //           value={"Apply"}
                  //           handleClick={handleApplyCoupon}
                  //         />
                  //       </>
                  //     )}
                  //   </div>
                  // </div>
                  <div className="card coupon_card mt-2">
                    <div className="gap-2 d-flex align-items-center">
                      {preFillCouponList.length == 1 ? (
                        preFillCouponList.map((item, index) => {
                          // console.log("item", item);
                          return (
                            <>
                              <div className="w-100 d-flex justify-content-between align-items-center">
                                <div className="gap-2 d-flex align-items-center">
                                  <img
                                    className="discountIcon"
                                    src="/assets/images/discountIcon.svg"
                                    alt=""
                                  />
                                  <div key={index}>
                                    <h4 className="mb-1 couponApply">
                                      {item && item?.coupon?.coupon_tilte}{" "}
                                      Applied
                                    </h4>
                                    <p className="m-0 savedtitle">
                                      You are Saving ₹ {item && item.discount}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {/* <Button2
                            value={"Remove"}
                            handleClick={handleRemoveCoupon}
                          /> */}
                            </>
                          );
                        })
                      ) : preFillCouponList.length > 1 ? (
                        <>
                          <input
                            className="coupon_field"
                            type=""
                            placeholder="View All Coupons"
                            disabled
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                          />
                          <Button2
                            value={"View"}
                            handleClick={handleViewCoupons}
                          />
                        </>
                      ) : (
                        <>
                          <input
                            className="coupon_field"
                            type=""
                            placeholder="Enter Coupon Here"
                            onChange={(e) => setCoupon(e.target.value)}
                          />
                          <Button2
                            value={"Apply"}
                            handleClick={handleApplyCoupon}
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
                {paymentMode == "EMI Payment" && (
                  <>
                    <Accordion className="emi_accordion" defaultActiveKey={key}>
                      {EMI &&
                        EMI.map((item, index) => {
                          // console.log('item', item)
                          return (
                            <Accordion.Item
                              eventKey={item.name}
                              onClick={() => handleInstallments(index, item)}
                              key={index}
                              className="mb-2"
                            >
                              <Accordion.Header
                                className={`${accordianId == index ? "active" : ""
                                  }`}
                              >
                                {item.name}
                              </Accordion.Header>
                              <Accordion.Body className="mt-2 card accordion_card">
                                <div>
                                  {item.amount_description.payment.map(
                                    (value, ind) => {
                                      // console.log('tax', item)
                                      return (
                                        <div className="mb-3 card acc_contentCard">
                                          <p className="m-0 installmentStripe">
                                            {ind == 0
                                              ? "1st Installment"
                                              : ind == 1
                                                ? "2nd Installment"
                                                : ind == 2
                                                  ? "3rd Installment"
                                                  : ind > 2 &&
                                                  `${ind + 1} Installment`}
                                          </p>
                                          <table className="insta_tbl">
                                            <thead>
                                              <tr>
                                                <th>Price:</th>
                                                <th>GST:</th>
                                                <th>Total:</th>
                                                <th>Due Date:</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr>
                                                <td>₹ {value}</td>
                                                <td>
                                                  {/* <FaRupeeSign />  */}₹
                                                  {value}
                                                </td>
                                                <td>
                                                  {/* <FaRupeeSign /> */}₹ ₹{" "}
                                                  {value}
                                                </td>
                                                <td>
                                                  ₹{" "}
                                                  {
                                                    item?.amount_description
                                                      ?.tax[ind]
                                                  }
                                                </td>
                                                <td>
                                                  {/* <FaRupeeSign /> */}₹{" "}
                                                  {
                                                    item?.amount_description
                                                      ?.total_amount[ind]
                                                  }
                                                </td>
                                                <td>
                                                  {
                                                    item?.amount_description
                                                      ?.cycle_dates[ind]
                                                  }
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                          );
                        })}
                    </Accordion>
                  </>
                )}
                <div className="card paymentCard mt-2">
                  <h4 className="orderTitle m-0">Payment Details</h4>
                  {courseData && (
                    <table className="mt-2 paymentTable">
                      <tbody>
                        {/* <tr className="row">
                        <td className="col-8">
                          <span className="p-4">Package Price </span>
                        </td>
                        {courseData.course_sp && (
                          <td className="col-4 t_price">
                            // <FaRupeeSign className="rupeeSign2" />
                            ₹
                            {courseData.course_sp}
                          </td>
                        )}
                      </tr> */}
                        <tr>
                          <td>
                            <p className="m-0 payTitle">Total Price</p>
                          </td>
                          {courseData.course_sp && (
                            <td>
                              <p className="m-0 text-end pay_r_title">
                                {/* <FaRupeeSign className="rupeeSign2" /> */}
                                <i className="bi bi-currency-rupee"></i>
                                {paymentMode == "EMI Payment" &&
                                  parseFloat(
                                    installment?.amount_description?.payment[0]
                                  ).toFixed(2)}
                                {paymentMode == "One Time Payment" &&
                                  (couponData
                                    ? parseFloat(couponData.mrp).toFixed(2)
                                    : parseFloat(courseData.mrp).toFixed(2))}
                              </p>
                            </td>
                          )}
                        </tr>
                        <tr>
                          <td>
                            <p className="m-0 payTitle">GST</p>
                          </td>
                          {courseData.course_sp && (
                            <td>
                              <p className="m-0 text-end pay_r_title">
                                {/* <FaRupeeSign className="rupeeSign2" /> */}
                                <i className="bi bi-currency-rupee"></i>
                                {paymentMode == "EMI Payment" &&
                                  parseFloat(
                                    installment?.amount_description?.tax[0]
                                  ).toFixed(2)}
                                {paymentMode == "One Time Payment" &&
                                  (couponData
                                    ? couponData.tax
                                    : courseData.tax)}
                              </p>
                            </td>
                          )}
                        </tr>
                        {courseData?.cat_type == 1 &&
                          courseData?.delivery_charge && (
                            <tr>
                              <td>
                                <p className="m-0 payTitle">Delivery Charge</p>
                              </td>
                              {/* {console.log('courseData', courseData)} */}
                              <td>
                                <p className="m-0 text-end pay_r_title">
                                  {/* <FaRupeeSign className="rupeeSign2" /> */}
                                  ₹
                                  {paymentMode == "EMI Payment" &&
                                    parseFloat(
                                      installment?.amount_description
                                        ?.delivery_charge
                                    ).toFixed(2)}
                                  {paymentMode == "One Time Payment" &&
                                    parseFloat(
                                      couponData?.delivery_charge
                                        ? couponData?.delivery_charge
                                        : courseData?.delivery_charge
                                    ).toFixed(2)}
                                </p>
                              </td>
                            </tr>
                          )}
                        <tr>
                          <td colSpan={2}>
                            <hr className="" />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p className="m-0 price_totalTitle">To Pay </p>
                          </td>
                          {console.log('couponData', couponData)}
                          {courseData?.cat_type == 1
                            ? courseData.course_sp && (
                              <td>
                                <p className="m-0 text-end totalAmount">
                                  {/* <FaRupeeSign className="rupeeSign2" /> */}
                                  <i className="bi bi-currency-rupee"></i>
                                  {paymentMode == "EMI Payment" &&
                                    parseFloat(
                                      installment?.amount_description
                                        ?.total_amount[0]
                                    ).toFixed(2)}
                                  {paymentMode == "One Time Payment" &&
                                    (couponData
                                      ? parseFloat(
                                        Number(couponData.mrp) +
                                        Number(couponData.tax)
                                      ).toFixed(2)
                                      : parseFloat(
                                        Number(courseData.mrp) +
                                        Number(courseData.tax)
                                      ).toFixed(2))}
                                </p>
                              </td>
                            )
                            : courseData.course_sp && (
                              <td>
                                <p className="m-0 text-end totalAmount">
                                  {/* <FaRupeeSign className="rupeeSign2" /> */}
                                  <i className="bi bi-currency-rupee"></i>
                                  {paymentMode == "EMI Payment" &&
                                    parseFloat(
                                      installment?.amount_description
                                        ?.total_amount[0]
                                    ).toFixed(2)}
                                  {paymentMode == "One Time Payment" &&
                                    (couponData
                                      ? parseFloat(
                                        Number(couponData?.mrp) +
                                        Number(couponData?.tax) +
                                        Number(
                                          couponData?.delivery_charge ? couponData?.delivery_charge : 0
                                        )
                                      ).toFixed(2)
                                      : parseFloat(
                                        Number(courseData?.mrp) +
                                        Number(courseData?.tax) +
                                        Number(
                                          courseData?.delivery_charge ? courseData?.delivery_charge : 0
                                        )
                                      ).toFixed(2))}
                                </p>
                              </td>
                            )}
                        </tr>
                      </tbody>
                    </table>
                  )}
                  <div className="col-md-12 my-2">
                    {/* <label
                      className="terms d-flex align-items-center"
                      for="defaultAddress"
                    >
                      <input
                        type="checkbox"
                        id="terms"
                        name="terms"
                        value={toggleTerms}
                        onChange={(e) => setToggleTerms(!toggleTerms)}
                      />
                      <span className="ms-2">
                        Before making payment you agree to our <br />
                        <Link
                          href="/terms&condition"
                          style={{ color: "#FF7426" }}
                        >
                          Terms & Condition
                        </Link>
                      </span>
                    </label> */}
                    <label class="container3 d-flex align-items-center">
                      <span className="ms-2">
                        Before making payment you agree to our <br />
                        <Link
                          href="/terms&condition"
                          style={{ color: "#FF7426" }}
                        >
                          Terms & Condition
                        </Link>
                      </span>
                      <input
                        type="checkbox"
                        value={toggleTerms}
                        onChange={(e) => setToggleTerms(!toggleTerms)}
                      />
                      <span class="checkmark"></span>
                    </label>
                  </div>
                  <div className="w-100 checkOutBtn mt-3">
                    <Button1
                      value={
                        isProcessing ? (
                          "Processing..."
                        ) : (
                          <>
                            Proceed To Checkout{" "}
                            <i className="bi bi-arrow-right"></i>
                          </>
                        )
                      }
                      disable={isProcessing}
                      handleClick={
                        courseData?.cat_type == 1
                          ? handleBookPayment
                          : handlePayment
                      }
                    />
                  </div>
                </div>
                <div
                  className="row premiumIcon mt-5 justify-content-center"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <span className="col-md-5">
                    <i class="bi bi-check-circle-fill" />
                    Certified product
                  </span>
                  <span className="col-md-5">
                    <i class="bi bi-check-circle-fill" />
                    Premium quality
                  </span>
                  <span className="col-md-5">
                    <i class="bi bi-check-circle-fill" />
                    Secure Checkout
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {showError && (
              <div className=" pt-0 flex-grow-1">
                <img src="/assets/images/BuyErrorImg.svg" alt="" />
                <h4>No Data found!</h4>
                <p>
                  Unable to locate data, seeking alternative methods for
                  retrieval.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default CourseOrderID;
