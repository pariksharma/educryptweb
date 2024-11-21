import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as Icon from "react-bootstrap-icons";
import OtpInput from "react-otp-input";
import { encrypt, get_token, decrypt, jwt_decode } from "@/utils/helpers";
import {
  stateListService,
  districtListService,
  sendVerificationOtpService,
  userLoginService,
  userRegisterService,
  updatePasswordService,
  getVersionService,
  userUpdateProfileService,
} from "@/services";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { all_version } from "@/store/sliceContainer/masterContentSlice";
import axiosClient from "@/services/axios";

const LoginModal = (props) => {
  const [isSignUpModal, setIsSignUpModal] = useState(false);
  const [getOTP, setGetOTP] = useState(false);
  const [withMobile, setWithMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [isRegisterPage, setIsRegisterPage] = useState(false);
  const [forgetPassword, setForgetPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [withEmail, setWithEmail] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [signUpWithOTP, setSignUpWithOTP] = useState(false);
  const initialTime = 60; // 1 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [deviceToken, setDeviceToken] = useState(0);
  const [jwt, setJwt] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  // const [versionData, setVersionData] = useState('');
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [OTP, setOTP] = useState("");
  const [error, setError] = useState("");
  const [stateList, setStateList] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [districtOption, setDistrictOption] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [appLogo, setAppLogo] = useState('')

  // useEffect(() => {
  //   fetchStateList();
  // })

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    state: "",
    district: "",
    password: "",
    confirmPassword: "",
  });

  const [resetForm, setResetForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const token = get_token();
  const router = useRouter();
  const dispatch = useDispatch();
  const versionData = useSelector((state) => state.allCategory?.versionData);

  useEffect(() => {
    if (isRegisterPage) {
      fetchStateList();
    }
    if (signUpWithOTP) {
      fetchStateList();
    }
  }, [isRegisterPage, signUpWithOTP]);

  useEffect(() => {
    if (isRegisterPage) {
      fetchDistrictList();
    }
    if (signUpWithOTP) {
      fetchDistrictList();
    }
  }, [userData.state]);

  useEffect(() => {
    if (!props.show) {
      setIsSignUpModal(false);
      setWithMobile(false);
      setGetOTP(false);
      setForgetPassword(false);
      setIsRegisterPage(false);
      setResetPassword(false);
      setWithEmail(false);
      setSignUpWithOTP(false);
      setOTP("");
      setMobile("");
      setPassword("");
      setUserData({
        name: "",
        email: "",
        state: "",
        district: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [props.show]);

  useEffect(() => {
    let interval;
    if (!isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(true);
    }

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // useEffect(() => {
  //   getVersion();
  // }, [])

  useEffect(() => {
    if (getOTP) {
      setOTP("");
    }
  }, [getOTP]);

  useEffect(() => {
    setAppLogo(localStorage.getItem('logo'))
    return () => {
      toast.dismiss();
    };
  }, []);

  const formatTime = (seconds) => {
    // console.log('hey')
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `0${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

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

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false);
      }, 1500);
    }
  }, [isToasterOpen]);

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

  // console.log(isToasterOpen)

  const handleSubmit = async (event, value) => {
    event.preventDefault();
    if (
      value == "login" &&
      (mobile.length == 10 || validateEmail(email)) &&
      password.length > 7
    ) {
      fetchUserLogin();
    } else if (value == "signupByNumber" && mobile.length == 10) {
      fetchOTPService();
    } else if (value == "signupByEmail" && validateEmail(email)) {
      fetchOTPService();
      // setGetOTP(true);
    } else if (value == "signupByEmail" && !email) {
      showErrorToast("Please, Enter your Email Id");
    } else if (
      (value == "login" || value == "signupByNumber") &&
      !mobile &&
      !withEmail
    ) {
      showErrorToast("Please, Enter Your mobile number");
    } else if (
      (value == "login" || value == "signupByNumber") &&
      mobile.length > 0 &&
      mobile.length !== 10
    ) {
      showErrorToast("Invalid Mobile Number");
    } else if (value == "login" && !password) {
      showErrorToast("Please,  Enter your password");
    } else if (value == "login" && password && password.length < 7) {
      showErrorToast("Password, length should be more than 8");
    } else if (value == "signupByEmail" && !validateEmail(email)) {
      showErrorToast("Please, Enter the valid email ");
    }
  };

  const fetchUserLogin = async () => {
    try {
      setIsToasterOpen(true);
      const formData = {
        mobile: !withEmail ? mobile : email,
        password: password,
        is_social: 0,
        device_id: 0,
      };
      // console.log("formData", formData);
      const response_login_service = await userLoginService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_login_data = decrypt(response_login_service.data, token);
      if (response_login_data.status) {
        showSuccessToast(response_login_data.message);
        // console.log("response_login_data", response_login_data);
        localStorage.setItem("jwt", response_login_data.data.jwt);
        jwt_decode(response_login_data.data.jwt);
        setTimeout(() => {
          if (router.pathname.startsWith("/view-courses")) {
            location.reload();
          } else {
            // window.location.href = '/private/myProfile/myCourse';
            router.push("/private/myProfile/myCourse");
          }
        }, 1000);
        props.onHide();
        setMobile("");
        setPassword("");
        setEmail("");
      } else {
        showErrorToast(response_login_data.message);
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const fetchResendOTP = async () => {
    try {
      setIsToasterOpen(true);
      if (isActive) {
        const formData = {
          mobile: !withMobile ? mobile : email,
          resend: 0,
          is_registration: !forgetPassword ? 1 : 0,
          c_code: countryCode,
          otp: 0,
        };
        const response_fetchOtp_service = await sendVerificationOtpService(
          encrypt(JSON.stringify(formData), token)
        );
        const response_fetchOtp_data = decrypt(
          response_fetchOtp_service.data,
          token
        );
        if (response_fetchOtp_data.status) {
          // console.log('hell')
          setIsActive(false);
          setTimeRemaining(60);
          formatTime(60);
          showSuccessToast(response_fetchOtp_data.message);
        } else showErrorToast(response_fetchOtp_data.message);
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const fetchOTPService = async () => {
    try{
      setIsToasterOpen(true);
      const formData = {
        mobile: !withMobile ? mobile : email,
        resend: 0,
        is_registration: !forgetPassword ? 1 : 0,
        c_code: countryCode,
        otp: !getOTP ? 0 : OTP,
      };
      // console.log('formData', formData)
      const response_fetchOtp_service = await sendVerificationOtpService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_fetchOtp_data = decrypt(
        response_fetchOtp_service.data,
        token
      );
      // console.log('response_fetchOtp_data', response_fetchOtp_data)
      if (response_fetchOtp_data.status) {
        showSuccessToast(response_fetchOtp_data.message);
        setIsActive(false);
        formatTime(60);
        setTimeRemaining(60);
        if (versionData.otp_login) {
          !getOTP
            ? setGetOTP(true)
            : forgetPassword
            ? setResetPassword(true)
            : setIsRegisterPage(true);
          // setMobile('');
          // setOTP('');
          // setEmail('');
        } else {
          //   localStorage.setItem("jwt", response_login_data.data.jwt);
          // jwt_decode(response_login_data.data.jwt);
          // setTimeout(() => {
          //   location.reload();
          // }, 1000)
          // props.onHide();
          // setMobile("");
          // setPassword("");
          // setEmail("")
        }
      } else showErrorToast(response_fetchOtp_data.message);
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const fetchLoginOTPService = async () => {
    try {
      setIsToasterOpen(true);
      const formData = {
        mobile: !withMobile ? mobile : email,
        resend: 0,
        is_registration: !forgetPassword ? 1 : 0,
        c_code: countryCode,
        otp: !getOTP ? 0 : OTP,
      };
      const response_fetchOtp_service = await sendVerificationOtpService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_fetchOtp_data = decrypt(
        response_fetchOtp_service.data,
        token
      );
      // console.log("response_fetchOtp_data", response_fetchOtp_data);
      if (response_fetchOtp_data.status) {
        showSuccessToast(response_fetchOtp_data.message);
        if (response_fetchOtp_data?.data?.is_registered == 0) {
          localStorage.setItem("jwt", response_fetchOtp_data.data.jwt);
          jwt_decode(response_fetchOtp_data.data.jwt);
          setTimeout(() => {
            if (router.pathname.startsWith("/view-courses")) {
              location.reload();
            } else {
              router.push("/private/myProfile/myCourse");
            }
          }, 1000);
          props.onHide();
          setMobile("");
          setPassword("");
          setEmail("");
          setOTP("");
        } else {
          // setIsRegisterPage(true);
          // setGetOTP(false)
          setJwt(response_fetchOtp_data?.data?.jwt);
          setDeviceToken(response_fetchOtp_data?.data?.is_registered);
          setSignUpWithOTP(true);
        }
      } else {
        showErrorToast(response_fetchOtp_data?.message);
        setOTP("");
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const fetchUserRegister = async () => {
    try {
      setIsToasterOpen(true);
      const formData = {
        name: userData.name,
        email: userData.email,
        mobile: mobile,
        password: userData.password,
        country: countryCode,
        state: userData.state,
        city: userData.district,
        device_id: 0,
        is_social: 0,
        device_token: 0,
        otp: OTP,
      };
      // console.log("formData", formData);
      const response_userResgister_service = await userRegisterService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_userRegister_data = decrypt(
        response_userResgister_service.data,
        token
      );
      // console.log("response_userRegister_data", response_userRegister_data);
      if (response_userRegister_data.status) {
        localStorage.setItem("jwt", response_userRegister_data.data.jwt);
        jwt_decode(response_userRegister_data.data.jwt);
        showSuccessToast(response_userRegister_data.message);
        location.reload();
        props.onHide();
      } else {
        showErrorToast(response_userRegister_data.message);
      }
      // console.log('response_userRegister_data', response_userRegister_data)
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
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
        setMobile(newNumber);
        setError(
          validateIndianNumber(newNumber) ? "" : "Invalid Indian number format"
        );
      }
    } else {
      setMobile(event.target.value);
    }
  };

  const validateIndianNumber = (number) => {
    // Regular expression for Indian mobile numbers starting with 6-9
    const mobileRegex = /^[6-9]\d{9}$/;

    return mobileRegex.test(number);
  };

  const validateEmail = (email) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputEmail = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    setError(validateEmail(newEmail) ? "" : "Invalid email format");
  };

  const handleInputPassword = (event) => {
    const valueWithoutSpaces = event.target.value.replace(/\s+/g, "");
    setPassword(valueWithoutSpaces);
  };

  const handleInputOTP = (event) => {
    const newOtp = event.target.value.replace(/[^0-9]/g, "");
    // if(newOtp )
    setOTP(newOtp);
  };

  const handleVerifyOTP = (event) => {
    event.preventDefault();
    if (OTP.length == 6) {
      // console.log("now you are login");
      fetchOTPService();
    } else if (!OTP) {
      showErrorToast("Please, Enter the OTP");
    } else if (OTP.length !== 6) {
      showErrorToast("Please, Enter the valid OTP");
    }
  };

  const handleLoginVerifyOTP = (event) => {
    event.preventDefault();
    if (OTP.length == 6) {
      fetchLoginOTPService();
    } else if (!OTP) {
      showErrorToast("Please, Enter the OTP");
    } else if (OTP.length !== 6) {
      showErrorToast("Please, Enter the valid OTP");
    }
  };

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
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const fetchDistrictList = async () => {
    try {
      const formData = {
        state_id: userData.state,
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
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const handleRegisterForm = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleDistrictInForm = (selectedOption) => {
    setUserData({
      ...userData,
      district: selectedOption.value,
    });
  };

  const handleStateInForm = (selectedOption) => {
    setUserData({
      ...userData,
      state: selectedOption.value,
    });
  };

  // console.log(userData)

  const handleRegister = (e) => {
    e.preventDefault();
    if (
      userData.name &&
      validateEmail(userData.email) &&
      userData.password.length > 7 &&
      userData.password == userData.confirmPassword
    ) {
      fetchUserRegister();
    } else if (!userData.name) {
      showErrorToast("Please, Enter your name");
    } else if (!userData.email) {
      showErrorToast("Please, Enter your Email");
    } else if (!validateEmail(userData.email)) {
      showErrorToast("Please, Enter the valid Email");
    } else if (userData.password !== userData.confirmPassword) {
      showErrorToast("Password and confirm Password didn't match");
    } else if (
      userData.password.length < 7 ||
      userData.confirmPassword.length < 7
    ) {
      showErrorToast("Password'length should be atleast 8");
    }
  };

  const fetchResetPassword = async () => {
    try {
      const formData = {
        mobile: mobile,
        password: resetForm.password,
        otp: OTP,
      };
      const response_forgetPassword_service = await updatePasswordService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_forgetPassword_data = decrypt(
        response_forgetPassword_service.data,
        token
      );
      if (response_forgetPassword_data.status) {
        props.onHide();
        showSuccessToast(response_forgetPassword_data.message);
      } else showErrorToast(response_forgetPassword_data.message);
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (resetForm.password && resetForm.password == resetForm.confirmPassword) {
      fetchResetPassword();
    } else if (!resetForm.password) {
      showErrorToast("Please, Enter the Password");
    } else if (!resetForm.confirmPassword) {
      showErrorToast("Please enter confirm Password");
    } else if (resetForm.password.length < 7) {
      showErrorToast("Password's length should be more than 8");
    } else if (resetForm.password !== resetForm.confirmPassword) {
      showErrorToast("Password and confirm Password didn't match!");
    }
  };

  const handleResetPassword = (e) => {
    const { name, value } = e.target;
    setResetForm({
      ...resetForm,
      [name]: value,
    });
  };

  // useEffect(() => {
  //   if(versionData.country != 0) {

  //   }
  // }, [versionData])

  // const getVersion = async () => {
  //   const formData = {};
  //   const response_getVersion_service = await getVersionService(encrypt(JSON.stringify(formData), token))
  //   const response_getVersion_data = decrypt(response_getVersion_service.data, token);
  //   if(response_getVersion_data.status) {
  //     dispatch(all_version(response_getVersion_data?.data?.permissions))
  //     setVersionData(response_getVersion_data?.data?.permissions)
  //   }
  //   console.log('response_getVersion_data', response_getVersion_data)
  // }

  const fetchOTPService2 = async () => {
    try {
      setIsToasterOpen(true);
      const formData = {
        mobile: mobile,
        resend: 0,
        is_registration: 1,
        c_code: countryCode ? countryCode : "",
        // otp: !getOTP ? 0 : OTP,
      };
      // console.log('formData', formData)
      const response_fetchOtp_service = await sendVerificationOtpService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_fetchOtp_data = decrypt(
        response_fetchOtp_service.data,
        token
      );
      // console.log("response_fetchOtp_data", response_fetchOtp_data);
      if (response_fetchOtp_data.status) {
        showSuccessToast(response_fetchOtp_data.message);
        setIsActive(false);
        formatTime(60);
        setTimeRemaining(60);
        !getOTP
          ? setGetOTP(true)
          : forgetPassword
          ? setResetPassword(true)
          : setIsRegisterPage(true);
        // setMobile('');
        // setOTP('');
        // setEmail('');
      } else showErrorToast(response_fetchOtp_data.message);
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const handleLoginOTP = async (event, value) => {
    event.preventDefault();
    if (value == "login" && mobile.length == 10) {
      // fetchUserLogin();
      fetchOTPService2();
    } else if (value == "signupByNumber" && mobile.length == 10) {
      fetchOTPService();
    } else if (value == "login" && mobile.length > 0 && mobile.length !== 10) {
      showErrorToast("Invalid Mobile Number");
    }
  };

  const classForActive = () => {
    if (
      userData.name &&
      userData.email &&
      userData.state &&
      userData.district &&
      userData.password &&
      userData.confirmPassword
    ) {
      return "btnEnabled";
    } else {
      return "btnDisabled";
    }
  };

  const classForActive2 = () => {
    if (
      userData.name &&
      userData.email &&
      userData.state &&
      userData.district
    ) {
      return "btnEnabled";
    } else {
      return "btnDisabled";
    }
  };

  const handleForgotPassword = () => {
    setForgetPassword(true);
    setMobile("");
  };

  // const handleSignUpWithOTP = (e) => {
  //   e.preventDefault();
  //   if (
  //     userData.name &&
  //     validateEmail(userData.email) &&
  //     userData.password.length > 7 &&
  //     userData.state &&
  //     userData.district &&
  //     userData.password == userData.confirmPassword
  //   ) {
  //     localStorage.setItem("jwt", jwt);
  //     localStorage.setItem('user_id', deviceToken)
  //     // jwt_decode(jwt);
  //     // fetchUserRegisterWithOTP();
  //     setTimeout(() => {
  //       fetchUserRegisterWithOTP();
  //     }, 0); // Smal
  //   } else if(!userData.name) {
  //     showErrorToast("Please, Enter your name");
  //   } else if(!userData.email) {
  //     showErrorToast("Please, Enter your Email");
  //   } else if(!validateEmail(userData.email)){
  //     showErrorToast("Please, Enter the valid Email");
  //   } else if (userData.password !== userData.confirmPassword) {
  //     showErrorToast("Password and confirm Password didn't match");
  //   }
  //   else if(userData.password.length < 7 || userData.confirmPassword.length < 7) {
  //     showErrorToast("Password'length should be atleast 8");
  //   }
  // }

  const handleFormValidationErrors = () => {
    if (versionData.otp_login == 0) {
      if (!userData.name) {
        showErrorToast("Please, Enter your name");
      } else if (!userData.email) {
        showErrorToast("Please, Enter your Email");
      } else if (!validateEmail(userData.email)) {
        showErrorToast("Please, Enter a valid Email");
      } else if (userData.password !== userData.confirmPassword) {
        showErrorToast("Password and confirm Password didn't match");
      } else if (userData.password.length < 8) {
        showErrorToast("Password length should be at least 8");
      }
    } else {
      if (!userData.name) {
        showErrorToast("Please, Enter your name");
      } else if (!userData.email) {
        showErrorToast("Please, Enter your Email");
      } else if (!validateEmail(userData.email)) {
        showErrorToast("Please, Enter a valid Email");
      }
    }
  };

  const handleSignUpWithOTP = (e) => {
    e.preventDefault();
    if (versionData.otp_login == 0) {
      if (
        userData.name &&
        validateEmail(userData.email) &&
        userData.password.length > 7 &&
        userData.state &&
        userData.district &&
        userData.password === userData.confirmPassword
      ) {
        localStorage.setItem("jwt", jwt);
        localStorage.setItem("user_id", deviceToken);
        setIsFormValid(true);
      } else {
        handleFormValidationErrors();
      }
    } else {
      if (
        userData.name &&
        validateEmail(userData.email) &&
        userData.state &&
        userData.district
      ) {
        localStorage.setItem("jwt", jwt);
        localStorage.setItem("user_id", deviceToken);
        setIsFormValid(true);
      } else {
        handleFormValidationErrors();
      }
    }
  };

  useEffect(() => {
    if (isFormValid) {
      fetchUserRegisterWithOTP();
      setIsFormValid(false);
    }
  }, [isFormValid]); // Trigger when userData or form validation status changes

  // const fetchUserRegisterWithOTP = async () => {
  //   setIsToasterOpen(true)
  //   const fonmm = {
  //     name: 'name',
  //     email: 'name@email.com',
  //     mobile: '9876543326',
  //     password: '12345678',
  //     c_code: '+91',
  //     country: "india",
  //     state: 'Uttar Pradesh',
  //     city: 'NOIDA',
  //     device_id: 0,
  //     is_social: 0,
  //     // user_id: deviceToken,
  //     // otp: OTP,
  //     profile_picture: "",
  //   };
  //   // return false
  //   try {

  //     let keyform = encrypt(JSON.stringify(fonmm), token)
  //     console.log('keyform', keyform)

  //       if(keyform){
  //         const response_userResgister_service = await userUpdateProfileService(
  //           keyform
  //         );
  //         const response_userRegister_data = decrypt(
  //           response_userResgister_service.data,
  //           token
  //         );
  //         let keyform2 = encrypt(JSON.stringify(fonmm), token)
  //         console.log("keyform 2",keyform2)
  //       }

  //     // console.log('response_userRegister_data', response_userRegister_data)
  //     // if (response_userRegister_data.status) {
  //     //   // localStorage.setItem("jwt", response_userRegister_data.data.jwt);
  //     //   // jwt_decode(response_userRegister_data.data.jwt);
  //     //   showSuccessToast(response_userRegister_data.message);
  //     //   // location.reload();
  //     //   // props.onHide();
  //     // } else {
  //     //   showErrorToast(response_userRegister_data.message);
  //     // }
  //   } catch (error) {
  //     console.log("error 763",error)
  //   }

  // }

  const fetchUserRegisterWithOTP = async () => {
    const fonmm = {
      name: userData.name, // Using userData values here
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password,
      c_code: "+91",
      country: "india",
      state: userData.state,
      city: userData.district,
      device_id: 0,
      is_social: 0,
      profile_picture: "",
    };

    try {
      let keyform = encrypt(JSON.stringify(fonmm), token);
      if (keyform) {
        const response_userResgister_service = await userUpdateProfileService(
          keyform
        );
        const response_userRegister_data = decrypt(
          response_userResgister_service.data,
          token
        );
        if (response_userRegister_data?.status) {
          showSuccessToast(response_userRegister_data.message);
          props.onHide();
          setTimeout(() => {
            window.location.replace("/");
          }, 500);
        } else {
          showErrorToast(response_userRegister_data.message);
        }
        // console.log("response_userRegister_data", response_userRegister_data);
      }
    } catch (error) {
      console.log("API error:", error);
    }
  };

  return (
    <>
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
      <Modal
        className="UserModal"
        {...props}
        size={!isRegisterPage ? "lg" : "lg"}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        {/* <Toaster position="top-right" reverseOrder={false}/> */}

        {!forgetPassword ? (
          <div className="row">
            {!isRegisterPage ? (
              <>
                <Modal.Header className="border-0 p-0">
                  <Button
                    variant="link"
                    className="custom-close-button text-decoration-none"
                    onClick={props.onHide}
                  >
                    <span
                      className="p-0"
                      style={{ marginTop: "-3px" }}
                      aria-hidden="true"
                    >
                      &times;
                    </span>{" "}
                    {/* Custom close icon */}
                  </Button>
                </Modal.Header>
                <div className="col-md-12 col-lg-6 py-3 padding_l">
                  {/* <div> */}
                  {!isSignUpModal ? (
                    versionData.otp_login == 0 ? (
                      // 0 ?

                      // ========================== User Login Without OTP ======================== //
                      <>
                        <img
                          src={appLogo ? appLogo : "/assets/images/eduLogo.png"}
                          className="modalLogo mb-3"
                        />
                        <h4 className="m-0 mb-1 w_Title">Welcome !</h4>
                        <p className="l_text">
                          Enter your details here to Login
                        </p>
                        <form
                          className="logInForm"
                          onSubmit={(e) => handleSubmit(e, "login")}
                          autoComplete="off"
                        >
                          {/* <span>
                        <img src="/assets/images/india.png" alt="" />
                        {countryCode}
                        <input
                          type="text"
                          id="phone"
                          placeholder="Enter mobile number"
                          value={mobile}
                          onChange={handleInputMobile}
                          autoComplete="off"
                        />
                      </span> */}
                          {!withEmail ? (
                            <div className="input-group mb-3">
                              <span
                                className="bg-white input_num input-group-text"
                                id="basic-addon1"
                              >
                                <select className="Num_list" disabled>
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
                                placeholder="Enter mobile number"
                                value={mobile}
                                onChange={handleInputMobile}
                              />
                              {/* <input type="text" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"> */}
                            </div>
                          ) : (
                            <div className="input-group mb-3">
                              <input
                                type="email"
                                className="emailAddress"
                                value={email}
                                placeholder="Enter email ID"
                                onChange={handleInputEmail}
                                autoComplete="off"
                              />
                              {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
                            </div>
                          )}
                          <div className="input-group mb-2">
                            <input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              className="password"
                              placeholder="Enter your password"
                              aria-label="Enter your password"
                              aria-describedby="basic-addon2"
                              onChange={handleInputPassword}
                              maxLength="13"
                              value={password}
                            />
                            <span
                              onClick={() => setShowPassword(!showPassword)}
                              className="input_sp input-group-text bg-white"
                              id="basic-addon2"
                            >
                              {showPassword ? <Icon.EyeSlash /> : <Icon.Eye />}
                            </span>
                          </div>
                          <span className="d-flex justify-content-end forgotText">
                            <p onClick={handleForgotPassword}>
                              Forgot Password?
                            </p>
                          </span>

                          <button
                            type="submit"
                            className={`mt-3 btn ${
                              !withEmail
                                ? mobile &&
                                  (!password ? "btnEnabled" : "btnDisabled")
                                  ? "btnEnabled"
                                  : "btnDisabled"
                                : email &&
                                  (!password ? "btnEnabled" : "btnDisabled")
                                ? "btnEnabled"
                                : "btnDisabled"
                            }`}
                            // disabled={!withEmail ? ((mobile && (!password ?  false : true)) ? false : true) : ((email && (!password ?  false : true)) ? false : true)}
                          >
                            Submit
                          </button>
                          {(versionData.email_show == 1 ||
                            versionData.google_login == 1) && (
                            <>
                              <div className="my-4 my-lg-0"></div>
                              <div className="text-center o-title my-4">
                                <p className="m-0 d-flex align-items-center Or-Title">
                                  Or
                                </p>
                              </div>
                            </>
                          )}
                        </form>
                        <div className="d-flex flex-wrap flex-md-nowrap gap-2 align-items-center justify-content-between">
                          {versionData.email_show == 1 && (
                            <>
                              {!withEmail ? (
                                <button
                                  className="btn loginBtn"
                                  onClick={() => setWithEmail(!withEmail)}
                                >
                                  Login with Email ID
                                </button>
                              ) : (
                                <button
                                  className="btn loginBtn"
                                  onClick={() => setWithEmail(!withEmail)}
                                >
                                  Login with Mobile Number
                                </button>
                              )}
                            </>
                          )}
                          {versionData.google_login == 1 && (
                            <button className="btn googleBtn">
                              <img src="/assets/images/loginWithGoogle.png" />
                              Login with Google
                            </button>
                          )}
                        </div>

                        <p className="m-0 mt-5 signUp_text">
                          Don't have an account?{" "}
                          <a
                            className="text-decoration-none"
                            onClick={() => {
                              setIsSignUpModal(true);
                              setMobile("");
                              setPassword("");
                            }}
                          >
                            Sign Up
                          </a>
                        </p>
                      </>
                    ) : !signUpWithOTP ? (
                      !getOTP ? (
                        // ========================== User Login With OTP ======================== //
                        <>
                          <img
                            src={appLogo ? appLogo : "/assets/images/eduLogo.png"}
                            className="modalLogo mb-3"
                          />
                          <h4 className="m-0 mb-1 w_Title">Welcome !</h4>
                          <p className="l_text">
                            Enter your details here to Login
                          </p>
                          <form
                            className="logInForm"
                            onSubmit={(e) => handleLoginOTP(e, "login")}
                            autoComplete="off"
                          >
                            <div className="input-group mb-3">
                              <span
                                className="bg-white input_num input-group-text"
                                id="basic-addon1"
                              >
                                <select className="Num_list" disabled>
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
                                placeholder="Enter mobile number"
                                value={mobile}
                                onChange={handleInputMobile}
                              />
                            </div>
                            <p
                              className="l_text mb-0"
                              style={{ fontSize: "10px", color: "#979797" }}
                            >
                              OTP will be sent to your mobile number
                            </p>
                            {/* <span className="d-flex justify-content-end forgotText">
                            <p onClick={handleForgotPassword}>
                              Forgot Password?
                            </p>
                          </span> */}

                            <button
                              type="submit"
                              className={`mt-3 btn ${
                                mobile.length != 10
                                  ? "btnDisabled"
                                  : "btnEnabled"
                              }`}
                              // disabled={((mobile.length !=10) ? true : false)}
                            >
                              Get OTP
                            </button>
                            {versionData.google_login == 1 && (
                              <>
                                <div className="my-4 my-lg-0"></div>
                                <div className="text-center o-title my-4">
                                  <p className="m-0 d-flex align-items-center Or-Title">
                                    Or
                                  </p>
                                </div>
                              </>
                            )}
                          </form>
                          <div className="d-flex flex-wrap flex-md-nowrap gap-2 align-items-center justify-content-between">
                            {versionData.google_login == 1 && (
                              <button className="btn googleBtn">
                                <img src="/assets/images/loginWithGoogle.png" />
                                Login with Google
                              </button>
                            )}
                          </div>
                          {versionData.otp_login == 0 && (
                            <p className="m-0 mt-5 signUp_text">
                              Don't have an account?{" "}
                              <a
                                className="text-decoration-none"
                                onClick={() => {
                                  setIsSignUpModal(true);
                                  setMobile("");
                                  setPassword("");
                                }}
                              >
                                Sign Up
                              </a>
                            </p>
                          )}
                        </>
                      ) : (
                        // ========================== Otp screen after User Login With OTP ======================== //
                        <>
                          <img
                            src={appLogo ? appLogo : "/assets/images/eduLogo.png"}
                            className="modalLogo mb-3"
                          />
                          <h4 className="m-0 w_Title">Enter OTP !</h4>
                          <p className="l_text mt-2">
                            We've sent an OTP to your registered mobile number
                            <br />
                            <div className="Otp_visibleNum d-flex align-items-center mt-2">
                              <span>
                                {versionData.country == 0
                                  ? `${countryCode} ${mobile} `
                                  : `${mobile} `}
                              </span>
                              <img
                                className="ms-1 editNumLogo"
                                src="/assets/images/editNumLogo.png"
                                alt=""
                                onClick={() => setGetOTP(false)}
                              />
                            </div>
                          </p>
                          <div className="otpContainer">
                            <OtpInput
                              className="d-flex gap-4 align-items-center"
                              value={OTP}
                              onChange={setOTP}
                              numInputs={6}
                              // renderSeparator={<span></span>}
                              renderInput={(props) => <input {...props} />}
                            />
                          </div>
                          <div className="d-flex justify-content-between align-items-center my-2">
                            {!isActive && (
                              <div id="countdown" className="resendOTP mt-0">
                                {formatTime(timeRemaining)}
                              </div>
                            )}
                            <p
                              className={`resendOTP m-0 ${
                                isActive ? "active" : ""
                              }`}
                            >
                              Didn't recieve code?{" "}
                              <span onClick={fetchResendOTP}>Resend</span>
                            </p>
                          </div>
                          {/* <p className="resendOTP">
                            Didn't recieve code?{" "}
                            <span onClick={fetchResendOTP}>Resend</span>
                          </p> */}
                          <button
                            className={`verifyBtn btn btnDisabled ${
                              OTP.length != 6 ? "btnDisabled" : "btnEnabled"
                            }`}
                            onClick={handleLoginVerifyOTP}
                            // disabled = {OTP.length != 6 ? true : false}
                          >
                            Verify
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <form
                          className="p-0 row c_profileForm"
                          onSubmit={handleSignUpWithOTP}
                          autoComplete="off"
                        >
                          <div className="col-md-12 padding_l">
                            <div className="row">
                              <div className="col-12">
                                <h4
                                  className="mb-4 w_Title text-start"
                                  style={{ color: "#404040", fontSize: "20px" }}
                                >
                                  Complete Your Profile
                                </h4>
                              </div>
                              <div className="col-md-12 margin_bottom">
                                <input
                                  className="form-control"
                                  type="text"
                                  name="name"
                                  value={userData.name}
                                  placeholder="Name"
                                  onChange={handleRegisterForm}
                                  autoComplete="off"
                                />
                              </div>
                              <div className="col-md-12 margin_bottom">
                                <input
                                  className="form-control"
                                  type="text"
                                  name="email"
                                  value={userData.email}
                                  placeholder="Email"
                                  onChange={handleRegisterForm}
                                  autoComplete="off"
                                />
                              </div>
                              <div className="col-md-12 margin_bottom">
                                <Select
                                className="select_state"
                                  name="state"
                                  value={
                                    stateOption.find(
                                      (stateOption) =>
                                        stateOption.value === userData.state
                                    ) || null
                                  }
                                  onChange={handleStateInForm}
                                  options={stateOption && stateOption}
                                  placeholder="state"
                                  isSearchable
                                />
                              </div>
                              <div className="col-md-12 margin_bottom">
                                <Select
                                className="select_city"
                                  name="district"
                                  value={
                                    districtOption.find(
                                      (districtOption) =>
                                        districtOption.value ===
                                        userData.district
                                    ) || null
                                  }
                                  onChange={handleDistrictInForm}
                                  options={districtOption && districtOption}
                                  placeholder="city"
                                  isSearchable
                                />
                              </div>
                              {versionData.otp_login == 0 && <>
                              <div className="col-md-12 margin_bottom">
                                <div className="input-group">
                                  <input
                                    id="password"
                                    name="password"
                                    className="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    onChange={handleRegisterForm}
                                    autoComplete="off"
                                    maxLength="13"
                                  />
                                  <span
                                    className="input_sp input-group-text bg-white"
                                    id="basic-addon2"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <Icon.EyeSlash />
                                    ) : (
                                      <Icon.Eye />
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="col-md-12 margin_bottom">
                                <div className="input-group">
                                  <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="password"
                                    type={showCPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    onChange={handleRegisterForm}
                                    autoComplete="off"
                                  />
                                  <span
                                    className="input_sp input-group-text bg-white"
                                    id="basic-addon2"
                                    onClick={() =>
                                      setShowCPassword(!showCPassword)
                                    }
                                  >
                                    {showCPassword ? (
                                      <Icon.EyeSlash />
                                    ) : (
                                      <Icon.Eye />
                                    )}
                                  </span>
                                </div>
                              </div>
                              </>}
                              <div className="col-md-12 mb-4">
                                <button
                                  className={`btn ${classForActive()}`}
                                  type="submit"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </>
                    )
                  ) : // ========================== Sign Up with mobile number ======================== //
                  !getOTP ? (
                    <>
                      <img
                        src={appLogo ? appLogo : "/assets/images/eduLogo.png"}
                        className="modalLogo mb-3"
                      />
                      <h4 className="m-0 mb-1 w_Title">Welcome !</h4>
                      <p className="l_text">
                        Enter your details here to Sign Up
                      </p>
                      <form
                        onSubmit={(e) => handleSubmit(e, "signupByNumber")}
                        autoComplete="off"
                      >
                        <div className="input-group mb-1">
                          <span
                            className="bg-white input_num input-group-text"
                            id="basic-addon1"
                          >
                            {/* <img src="/assets/images/india.png" alt="" /> */}
                            {/* {countryCode} */}
                            <select className="Num_list" disabled>
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
                            id="phone"
                            className="mobNum"
                            placeholder="Enter mobile number"
                            value={mobile}
                            onChange={handleInputMobile}
                            autoComplete="off"
                          />
                        </div>
                        <p
                          className="l_text mb-0"
                          style={{ fontSize: "10px", color: "#979797" }}
                        >
                          OTP will be sent to your mobile number
                        </p>
                        {/* <p
                            className="forgotLink"
                            onClick={handleForgotPassword}
                          >
                            Forgot Password?
                          </p> */}
                        <button
                          type="submit"
                          className={`mt-3 btn ${
                            mobile.length !== 10 ? "btnDisabled" : "btnEnabled"
                          }`}
                          // disabled={mobile.length !== 10 ? true: false }
                        >
                          Get OTP
                        </button>
                        {/* <div className="my-4 my-lg-0"></div>
                          <div className="text-center o-title my-4">
                            <p className="m-0 d-flex align-items-center Or-Title">
                              Or
                            </p>
                          </div> */}
                      </form>
                      <p className="m-0 mt-5 signUp_text">
                        Have an account?{" "}
                        <a
                          className="text-decoration-none"
                          onClick={() => {
                            setIsSignUpModal(false);
                            setMobile("");
                            setPassword("");
                          }}
                        >
                          Login
                        </a>
                      </p>
                      {/* <div className="d-flex flex-wrap flex-md-nowrap gap-2 align-items-center justify-content-between">
                          <button
                            className="btn loginBtn"
                            onClick={() => setWithMobile(true)}
                          >
                            Login with Email ID
                          </button>
                          <button className="btn googleBtn">
                            <img src="/assets/images/loginWithGoogle.png" />
                            Login with Google
                          </button>
                        </div> */}
                    </>
                  ) : (
                    // ========================== Otp screen after Sign Up with Mobile Number ======================== //
                    <>
                      <img
                        src={appLogo ? appLogo : "/assets/images/eduLogo.png"}
                        className="modalLogo mb-3"
                      />
                      <h4 className="m-0 w_Title">Enter OTP !</h4>
                      <p className="l_text mt-2">
                        We've sent an OTP to your registered mobile number
                        <br />
                        <div className="Otp_visibleNum d-flex align-items-center mt-2">
                          <span>
                            {versionData.country == 0
                              ? `${countryCode} ${mobile} `
                              : `${mobile} `}
                          </span>
                          <img
                            className="ms-1 editNumLogo"
                            src="/assets/images/editNumLogo.png"
                            alt=""
                            onClick={() => setGetOTP(false)}
                          />
                        </div>
                      </p>
                      <div className="otpContainer">
                        <OtpInput
                          className="d-flex gap-4 align-items-center"
                          value={OTP}
                          onChange={setOTP}
                          numInputs={6}
                          // renderSeparator={<span></span>}
                          renderInput={(props) => <input {...props} />}
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center my-2">
                        {!isActive && (
                          <div id="countdown" className="resendOTP mt-0">
                            {formatTime(timeRemaining)}
                          </div>
                        )}
                        <p
                          className={`resendOTP m-0 ${
                            isActive ? "active" : ""
                          }`}
                        >
                          Didn't recieve code?{" "}
                          <span onClick={fetchResendOTP}>Resend</span>
                        </p>
                      </div>
                      {/* <p className="resendOTP">
                          Didn't recieve code?{" "}
                          <span onClick={fetchResendOTP}>Resend</span>
                        </p> */}
                      <button
                        className={`verifyBtn btn ${
                          OTP.length != 6 ? "btnDisabled" : "btnEnabled"
                        }`}
                        onClick={handleVerifyOTP}
                        // disabled = {OTP.length != 6 ? true : false}
                      >
                        Verify
                      </button>
                    </>
                  )}
                </div>
                {/* </div> */}
                <div className="col-md-6 d-none d-md-none d-lg-block">
                  <div className="ImageContainer">
                    <img src="/assets/images/login_image.png" />
                  </div>
                </div>
              </>
            ) : (
              // ========================== Registration Form ======================== //
              <>
                <Modal.Header className="border-0 p-0">
                  <Button
                    variant="link"
                    className="custom-close-button text-decoration-none"
                    onClick={props.onHide}
                  >
                    <span
                      className="p-0"
                      style={{ marginTop: "-3px" }}
                      aria-hidden="true"
                    >
                      &times;
                    </span>{" "}
                    {/* Custom close icon */}
                  </Button>
                </Modal.Header>
                <form
                  className="p-0 row c_profileForm"
                  onSubmit={handleRegister}
                  autoComplete="off"
                >
                  <div className="col-md-12 col-lg-6 py-3 padding_l">
                    <div className="row">
                      <div className="col-12">
                        <h4
                          className="mb-4 w_Title text-start"
                          style={{ color: "#404040", fontSize: "20px" }}
                        >
                          Complete Your Profile
                        </h4>
                      </div>
                      <div className="col-md-12 margin_bottom">
                        <input
                          className="form-control"
                          type="text"
                          name="name"
                          value={userData.name}
                          placeholder="Name"
                          onChange={handleRegisterForm}
                          autoComplete="off"
                        />
                      </div>
                      <div className="col-md-12 margin_bottom">
                        <input
                          className="form-control"
                          type="text"
                          name="email"
                          value={userData.email}
                          placeholder="Email"
                          onChange={handleRegisterForm}
                          autoComplete="off"
                        />
                      </div>
                      <div className="col-md-12 margin_bottom">
                        {/* <input
                  type="text"
                  name="state"
                  value={userData.state}
                  placeholder="State"
                  onChange={handleRegisterForm}
                /> */}
                        {/* <select
                      className="form-control"
                      id="state"
                      name="state"
                      value={userData.state}
                      onChange={handleRegisterForm}
                      autoComplete="off"
                    >
                      <option value="">State</option>
                      {stateList &&
                        stateList.map((item, i) => {
                          return (
                            <option value={item.id} key={i}>
                              {item.name}
                            </option>
                          );
                        })}
                    </select> */}
                        <Select
                          name="state"
                          value={
                            stateOption.find(
                              (stateOption) =>
                                stateOption.value === userData.state
                            ) || null
                          }
                          onChange={handleStateInForm}
                          options={stateOption && stateOption}
                          placeholder="state"
                          isSearchable
                        />
                      </div>
                      <div className="col-md-12 margin_bottom">
                        {/* <select
                      className="form-control"
                      id="district"
                      name="district"
                      value={userData.district}
                      onChange={handleRegisterForm}
                      autoComplete="off"
                    >
                      <option value="" disabled>
                        District
                      </option>
                      {districtList &&
                        districtList.map((item, i) => {
                          return (
                            <option value={item.id} key={i}>
                              {item.name}
                            </option>
                          );
                        })}
                    </select> */}
                        <Select
                          name="district"
                          value={
                            districtOption.find(
                              (districtOption) =>
                                districtOption.value === userData.district
                            ) || null
                          }
                          onChange={handleDistrictInForm}
                          options={districtOption && districtOption}
                          placeholder="city"
                          isSearchable
                        />
                      </div>
                      <div className="col-md-12 margin_bottom">
                        <div className="input-group">
                          <input
                            id="password"
                            name="password"
                            className="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            onChange={handleRegisterForm}
                            autoComplete="off"
                            maxLength="13"
                          />
                          <span
                            className="input_sp input-group-text bg-white"
                            id="basic-addon2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <Icon.EyeSlash /> : <Icon.Eye />}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-12 margin_bottom">
                        <div className="input-group">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            className="password"
                            type={showCPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            onChange={handleRegisterForm}
                            autoComplete="off"
                          />
                          <span
                            className="input_sp input-group-text bg-white"
                            id="basic-addon2"
                            onClick={() => setShowCPassword(!showCPassword)}
                          >
                            {showCPassword ? <Icon.EyeSlash /> : <Icon.Eye />}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-12 mb-4">
                        <button
                          className={`btn ${classForActive()}`}
                          type="submit"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-0 col-md-6 d-none d-md-none d-lg-block">
                    <div className="ImageContainer">
                      <img src="/assets/images/login_image.png" />
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        ) : (
          // ========================== Forgot Password ======================== //
          <>
            <Modal.Header className="border-0 p-0">
              <Button
                variant="link"
                className="custom-close-button text-decoration-none"
                onClick={props.onHide}
              >
                <span
                  className="p-0"
                  style={{ marginTop: "-3px" }}
                  aria-hidden="true"
                >
                  &times;
                </span>{" "}
                {/* Custom close icon */}
              </Button>
            </Modal.Header>
            <div className="row">
              <div className="col-md-12 col-lg-6 py-3 padding_l">
                {!resetPassword ? (
                  <>
                    {!getOTP ? (
                      <>
                        <img
                          src={appLogo ? appLogo : "/assets/images/eduLogo.png"}
                          className="modalLogo mb-3"
                        />
                        <h4 className="m-0 mt-4 w_Title">Forgot Password</h4>
                        <p className="m-0 l_text">
                          Reset password with your mobile number
                        </p>
                        <form
                          onSubmit={(e) => handleSubmit(e, "signupByNumber")}
                          autoComplete="off"
                        >
                          <div className="input-group mb-1 mt-3">
                            <span
                              className="bg-white input_num input-group-text"
                              id="basic-addon1"
                            >
                              <select className="Num_list" disabled>
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
                              placeholder="Enter mobile number"
                              value={mobile}
                              onChange={handleInputMobile}
                            />
                            {/* <input type="text" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"> */}
                          </div>
                          <p
                            className="l_text mb-0"
                            style={{ fontSize: "10px", color: "#979797" }}
                          >
                            OTP will be sent to your mobile number
                          </p>
                          <button
                            className={`mt-5 btn ${
                              mobile.length != 10 ? "btnDisabled" : "btnEnabled"
                            }`}
                            type="submit"
                            // disabled = {mobile.length != 10 ? true : false}
                          >
                            Get OTP
                          </button>
                        </form>
                        <p className="m-0 mt-5 signUp_text">
                          Have an account?{" "}
                          <a
                            className="text-decoration-none"
                            onClick={() => {
                              setIsSignUpModal(false);
                              setForgetPassword(false);
                              setMobile("");
                              setPassword("");
                            }}
                          >
                            Login
                          </a>
                        </p>
                      </>
                    ) : (
                      // ========================== OTP Screen after Forgot Password ======================== //
                      <>
                        <img
                          src={appLogo ? appLogo : "/assets/images/eduLogo.png"}
                          className="modalLogo mb-3"
                        />
                        <h4 className="m-0 mt-4 w_Title">Enter OTP !</h4>
                        <p className="l_text mt-2">
                          We've sent an OTP to your registered mobile number{" "}
                          <br />
                          <div className="Otp_visibleNum d-flex align-items-center mt-2">
                            <span>
                              {versionData.country == 0
                                ? `${countryCode} ${mobile} `
                                : `${mobile} `}
                            </span>
                            <img
                              src="/assets/images/editNumLogo.png"
                              alt=""
                              onClick={() => setGetOTP(false)}
                            />
                          </div>
                        </p>
                        <div className="otpContainer">
                          <OtpInput
                            className="d-flex gap-4 align-items-center"
                            value={OTP}
                            onChange={setOTP}
                            numInputs={6}
                            // renderSeparator={<span></span>}
                            renderInput={(props) => <input {...props} />}
                          />

                          <div className="d-flex justify-content-between align-items-center my-2">
                            {!isActive && (
                              <div id="countdown" className="resendOTP mt-0">
                                {formatTime(timeRemaining)}
                              </div>
                            )}
                            <p
                              className={`resendOTP m-0 ${
                                isActive ? "active" : ""
                              }`}
                            >
                              Didn't recieve code?{" "}
                              <span onClick={fetchResendOTP}>Resend</span>
                            </p>
                          </div>
                          <button
                            className={`verifyBtn btn ${
                              OTP.length != 6 ? "btnDisabled" : "btnEnabled"
                            }`}
                            onClick={handleVerifyOTP}
                            // disabled = {OTP.length != 6 ? true : false}
                          >
                            Verify
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  // ========================== Create Password after Forgot Password ======================== //
                  <>
                    <img
                      src={appLogo ? appLogo : "/assets/images/eduLogo.png"}
                      className="modalLogo mb-3"
                    />
                    <h4 className="mb-1 mt-4 w_Title">Forgot Password</h4>
                    <p className="l_text" style={{ fontSize: "11px" }}>
                      Create password to continue
                    </p>
                    <form onSubmit={handlePasswordSubmit} autoComplete="off">
                      <div className="input-group mb-3">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className="forgot_password"
                          placeholder="Password"
                          onChange={handleResetPassword}
                          autoComplete="off"
                          maxLength="13"
                        />
                        <span
                          className="input_fp input-group-text"
                          id="basic-addon2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Icon.EyeSlash /> : <Icon.Eye />}
                        </span>
                      </div>
                      <div className="input-group mb-3">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          className="forgot_password"
                          type={showCPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          onChange={handleResetPassword}
                          autoComplete="off"
                        />
                        <span
                          className="input_fp input-group-text"
                          id="basic-addon3"
                          onClick={() => setShowCPassword(!showCPassword)}
                        >
                          {showCPassword ? <Icon.EyeSlash /> : <Icon.Eye />}
                        </span>
                      </div>
                      <button
                        className={`mt-5 btn btnDisabled ${
                          resetForm.password && resetForm.confirmPassword
                            ? "btnEnabled"
                            : "btnDisabled"
                        }`}
                        type="submit"
                      >
                        Submit
                      </button>
                    </form>
                  </>
                )}
              </div>
              <div className="col-md-6 d-none d-md-none d-lg-block">
                <div className="loginImageContainer">
                  <img
                    src="/assets/images/login_image.png"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
  // }
};

export default LoginModal;
