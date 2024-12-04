import { sendVerificationOtpService, updatePasswordService } from "@/services";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OtpInput from "react-otp-input";
import * as Icon from "react-bootstrap-icons";

const UpdatePasswordModal = (props) => {
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [getOTP, setGetOTP] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const initialTime = 60; // 1 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [resetPassScreen, setResetPassScreen] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [logo, setLogo] = useState('')
  const [OTP, setOTP] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const token = get_token();
  const versionData = useSelector((state) => state.allCategory?.versionData);

  const [resetForm, setResetForm] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false);
      }, 1000);
    }
  }, [isToasterOpen]);


  useEffect(() => {
      const AppLogo = localStorage.getItem("logo");
      setLogo(AppLogo);
  }, [])

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

  useEffect(() => {
    if (!props.show) {
      setMobile("");
      setGetOTP(false);
      setOTP("");
      setResetPassScreen('')
      setResetForm({
        password: "",
        confirmPassword: "",
      })
    }
  }, [props.show]);

  const formatTime = (seconds) => {
    // console.log('hey')
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `0${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
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

  const showErrorToast = (toastMsg) => {
    if (!isToasterOpen) {
      setIsToasterOpen(true);
      toast.error(toastMsg, {
        // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
        autoClose: 1500
    });
    }
  }

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
        setMobile(newNumber);
        setError(
          validateIndianNumber(newNumber) ? "" : "Invalid Indian number format"
        );
      }
    } else {
      setMobile(event.target.value);
    }
  };

  const handlefetchOTP = (e) => {
    e.preventDefault();
    if (mobile && mobile.length == 10) {
      fetchOTPService();
    }
  };

  const fetchOTPService = async () => {
    try {
      const formData = {
        mobile: mobile,
        resend: 0,
        is_registration: 1,
        c_code: countryCode,
        otp: 0,
      };
      const response_fetchOtp_service = await sendVerificationOtpService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_fetchOtp_data = decrypt(
        response_fetchOtp_service?.data,
        token
      );
      if (response_fetchOtp_data?.status) {
        showSuccessToast(response_fetchOtp_data?.message);
        setGetOTP(true)
        setIsActive(false)
        formatTime(60)
        setTimeRemaining(60);
      }
      else {
        showErrorToast(response_fetchOtp_data?.message)
      }
    } catch (error) {
      console.log("error found: ", error);
    }
  };

  const fetchResendOTP = async () => {
    setIsToasterOpen(true)
    if(isActive) {
      const formData = {
        mobile: mobile ,
        resend: 1,
        is_registration: 1,
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
        setIsActive(false)
        setTimeRemaining(60);
        formatTime(60)
        showSuccessToast(response_fetchOtp_data.message);
      } else showErrorToast(response_fetchOtp_data.message);
    }
  };

  const handleEdit = () => {
    setGetOTP(false)
    setOTP('')
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if(OTP?.length == 6) {
      const formData = {
        mobile: mobile,
        resend: 0,
        is_registration: 0,
        c_code: countryCode,
        otp: OTP
      }
      const fetch_verifyOTP_service = await sendVerificationOtpService(encrypt(JSON.stringify(formData), token));
      const fetch_verifyOTP_data = decrypt(fetch_verifyOTP_service.data, token);
      if(fetch_verifyOTP_data?.status) {
        showSuccessToast(fetch_verifyOTP_data?.message)
        setResetPassScreen(true)
      }
      else{
        showErrorToast(fetch_verifyOTP_data?.message)
      }
    }
    // console.log('done')
  }

  const handleResetPassword = (e) => {
    const { name, value } = e.target;
    setResetForm({
      ...resetForm,
      [name]: value,
    });
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

  const fetchResetPassword = async () => {
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
  };

  return (
    <>
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
    <Modal
      {...props}
      size={""}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="profile_change_pass"
    >
      <Modal.Header className="border-0 p-0">
        <img 
          src={logo && logo} alt="" 
          style={{width: '120px',
            height: '40px'
          }}
        />
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
          </Button>
      </Modal.Header>
      {!resetPassScreen ? 
        !getOTP ? (
          <>
            <h4 className="l_text mt-4 mb-2">Enter mobile number to continue</h4>
            <form onSubmit={handlefetchOTP}>
              <div className="flex-nowrap input-group mb-1 mt-3">
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
                          {countryCode}
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
              <button
                className={`mt-5 btn ${
                  mobile.length != 10 ? "btnDisabled" : "btnEnabled"
                }`}
                type="submit"
                // disabled = {mobile.length != 10 ? true : false}
              >
                Continue
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <p className="mt-4 l_text">
              We've sent an OTP to your registered mobile number
              <br />
              <div className="mt-3 Otp_visibleNum d-flex align-items-center">
                <span>
                  {versionData.country == 0
                    ? `${countryCode} ${mobile} `
                    : `${mobile} `}
                </span>
                <img
                  className="ms-1 editNumLogo"
                  src="/assets/images/editNumLogo.png"
                  alt=""
                  onClick={handleEdit}
                  style={{cursor: 'pointer'}}
                />
              </div>
            </p>
            <div className="otpContainer mt-1 w-50">
              <OtpInput
                className="d-flex gap-4 align-items-center"
                value={OTP}
                onChange={setOTP}
                numInputs={6}
                // renderSeparator={<span></span>}
                renderInput={(props) => <input {...props} />}
              />
            </div>
            {!isActive && <div id="countdown">{formatTime(timeRemaining)}</div>}
            <p className={`resendOTP ${isActive ? "active" : ""}`}>
              Didn't recieve code? <span onClick={fetchResendOTP}>Resend</span>
            </p>
            {/* <p className="resendOTP">
              Didn't recieve code?{" "}
              <span onClick={fetchResendOTP}>Resend</span>
            </p> */}
            <button
              type="submit"
              className={`verifyBtn btn btnDisabled ${
                OTP.length != 6 ? "btnDisabled" : "btnEnabled"
              }`}
              // onClick={handleLoginVerifyOTP}
              // disabled = {OTP.length != 6 ? true : false}
            >
              Verify
            </button>
          </form>
        )
      :
      <>
        <p className="mt-4 mb-3 l_text" style={{ fontSize: "11px" }}>
          Create password to continue
        </p>
        <form 
          onSubmit={handlePasswordSubmit} 
          autoComplete="off"
        >
          <div className="input-group mb-3 flex-nowrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="password border-end-0"
              placeholder="Password"
              onChange={handleResetPassword}
              autoComplete="off"
              maxLength="13"
            />
            <span
              style={{border: '1px solid #c2c2c2'}}
              className="input_fp input-group-text border-start-0 bg-white"
              id="basic-addon2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Icon.EyeSlash /> : <Icon.Eye />}
            </span>
          </div>
          <div className="input-group mb-3 flex-nowrap">
            <input
              id="confirmPassword"
              name="confirmPassword"
              className="password border-end-0"
              type={showCPassword ? "text" : "password"}
              placeholder="Confirm Password"
              onChange={handleResetPassword}
              autoComplete="off"
            />
            <span
              style={{border: '1px solid #c2c2c2'}}
              className="input_fp input-group-text bg-white border-start-0"
              id="basic-addon3"
              onClick={() => setShowCPassword(!showCPassword)}
            >
              {showCPassword ? <Icon.EyeSlash /> : <Icon.Eye />}
            </span>
          </div>
          <button className={`mt-5 btn btnDisabled ${(resetForm.password && resetForm.confirmPassword) ? "btnEnabled" : "btnDisabled"}`} type="submit">
            Submit
          </button>
        </form>
      </>
      }
    </Modal>
    </>
  );
};

export default UpdatePasswordModal;
