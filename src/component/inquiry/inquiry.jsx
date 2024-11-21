import { decrypt, encrypt, get_token } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  InquiryListService,
  InquiryReplyListService,
  InquiryReplyService,
  InquiryService,
} from "@/services";
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import ErrorPage from "../errorPage";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import LoaderAfterLogin from "../loaderAfterLogin";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import { useRouter } from "next/router";
import Head from 'next/head';

const InquiryType = [
  { value: 1, label: "Payment Issue" },
  { value: 2, label: "Video Class" },
  { value: 3, label: "Test Series" },
  { value: 4, label: "Others" },
];

const Inquiry = ({title}) => {
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [showError, setShowError] = useState(false);
  const [convoDetail, setConvoDetail] = useState(false);
  const [conversationList, setConversationList] = useState([]);
  const [replyList, setReplyList] = useState([]);
  const [reply, setReply] = useState("");
  const [key, setKey] = useState("add");
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    mobile: "",
    email: "",
    issueType: "",
    message: "",
  });

  const versionData = useSelector((state) => state.allCategory?.versionData);
  const token = get_token();
  const router = useRouter();

  useEffect(() => {
    toast.dismiss();
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    setShowError(false);
    setConvoDetail(false);
    setReplyList([]);
    if (key == "view") {
      fetchConverstaionList();
    }
  }, [key]);

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false);
      }, 2500);
    }
  }, [isToasterOpen]);

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
    // console.log('popup222')
    if (!isToasterOpen) {
      setIsToasterOpen(true);
      toast.success(toastMsg, {
        // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
        autoClose: 1500,
      });
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
        setInquiryForm({
          ...inquiryForm,
          mobile: newNumber,
        });
        //   setError(
        //     validateIndianNumber(newNumber) ? "" : "Invalid Indian number format"
        //   );
      }
    } else {
      setInquiryForm({
        ...inquiryForm,
        mobile: event.target.value,
      });
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

  const handleInputData = (e) => {
    const { name, value } = e.target;
    if (name == "name") {
      setInquiryForm({ ...inquiryForm, name: value.replace(/[0-9]/g, "") });
    } else {
      setInquiryForm({
        ...inquiryForm,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inquiryForm.name) {
      showErrorToast("Please enter your name");
    } else if (!inquiryForm.mobile) {
      showErrorToast("Please enter your mobile number");
    } else if (
      versionData.country == 0 &&
      !validateIndianNumber(inquiryForm.mobile)
    ) {
      showErrorToast("Please enter your valid mobile number");
    } else if (!inquiryForm.email) {
      showErrorToast("Please enter your email");
    } else if (!validateEmail(inquiryForm.email)) {
      showErrorToast("Please enter your valid email");
    } else if (!inquiryForm.message) {
      showErrorToast("Please enter your message");
    } else {
      handleSubmitForm();
    }
  };

  const handleSubmitForm = async () => {
    try {
      const formData = {
        name: inquiryForm.name,
        mobile: inquiryForm.mobile,
        email: inquiryForm.email,
        message: inquiryForm.message,
        type: inquiryForm.issueType,
      };
      const response_inquiry_service = await InquiryService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_inquiry_data = decrypt(
        response_inquiry_service.data,
        token
      );
      if (response_inquiry_data?.status) {
        showSuccessToast(response_inquiry_data.data);
        setShowConversation(true);
        setKey("view");
        setInquiryForm({
          name: "",
          mobile: "",
          email: "",
          issueType: "",
          message: "",
        });
      }
      fetchConverstaionList();
      // console.log("response_inquiry_data", response_inquiry_data);
    } catch (error) {
      console.log("error found: ", error);
      router.push("/");
    }
  };

  const handleConversation = () => {
    setShowConversation(true);
  };

  const fetchConverstaionList = async () => {
    try {
      const formData = {};
      const response_inquiryConverstaion_service = await InquiryListService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_inquiryConverstaion_data = decrypt(
        response_inquiryConverstaion_service.data,
        token
      );
      if (response_inquiryConverstaion_data.status) {
        setConversationList(
          response_inquiryConverstaion_data?.data.filter(
            (item) => item.type != 0
          )
        );
        if (
          response_inquiryConverstaion_data?.data.filter(
            (item) => item.type != 0
          )?.length == 0
        ) {
          setShowError(true);
        }
      } else {
        setShowError(true);
      }
      // console.log(
      //   response_inquiryConverstaion_data,
      //   response_inquiryConverstaion_data
      // );
    } catch (error) {
      console.log("error found: ", error);
    }
  };

  const handleIssueType = (selectedOption) => {
    // console.log(selectedOption)
    setInquiryForm({
      ...inquiryForm,
      issueType: selectedOption.value,
    });
  };

  const handleTabChange = (k) => {
    // console.log(key)
    setKey(k);
  };

  const handleViewDetail = (value) => {
    setConvoDetail(true);
    fetchInquiryReplyList();
  };

  const fetchInquiryReplyList = async () => {
    try {
      const formData = {};
      const response_inquiryReplyList_service = await InquiryReplyListService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_inquiryReplyList_data = decrypt(
        response_inquiryReplyList_service.data,
        token
      );
      if (response_inquiryReplyList_data.status) {
        setReplyList(response_inquiryReplyList_data.data);
      } else {
        setReplyList([]);
      }
      // console.log(
      //   "response_inquiryReplyList_data",
      //   response_inquiryReplyList_data
      // );
    } catch (error) {
      console.log("error found: ", error);
    }
  };

  const handleReplyIssue = async (id) => {
    try {
      if (reply) {
        const formData = {
          contact_us_id: id,
          message: reply,
        };
        const response_inquiryReply_service = await InquiryReplyService(
          encrypt(JSON.stringify(formData), token)
        );
        const response_inquiryReply_data = decrypt(
          response_inquiryReply_service.data,
          token
        );
        // console.log("response_inquiryReply_data", response_inquiryReply_data);
        if (response_inquiryReply_data.status) {
          fetchInquiryReplyList();
        } else {
          showErrorToast(response_inquiryReply_data.message);
        }
      } else {
        showErrorToast("Please specify your issue");
      }
    } catch (error) {
      console.log("error found: ", error);
    }
  };

  return (
    <>
      {/* <Toaster position="top-right" reverseOrder={false} /> */}
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
 
      <div className="container-fluid p-0">
        {convoDetail && (
          <div className="col-md-12 p-0">
            <nav aria-label="breadcrumb ">
              <ol className="breadcrumb mb-4 cursor">
                <li
                  className="breadcrumb-item"
                  onClick={() => setConvoDetail(false)}
                >
                  <Icon.ChevronLeft />
                  {`Back`}
                </li>
              </ol>
            </nav>
          </div>
        )}
        <div className="row inquiryTab">
          <div className="col-lg-7 col-md-9 col-sm-12 m-auto">
            <Tabs
              id="controlled-tab-example1"
              activeKey={key}
              onSelect={(k) => handleTabChange(k)}
              className="CustomTab mb-2"
            >
              <Tab eventKey="add" title="+ ADD ISSUE">
                <div className="card addIssue_Card px-4 py-3 mt-2">
                  <form onSubmit={handleSubmit}>
                    <div className="getInTouchForm mb-1">
                      <input
                        name="name"
                        type="text"
                        placeholder="Name*"
                        value={inquiryForm.name}
                        onChange={handleInputData}
                        autoComplete="off"
                      />
                    </div>
                    <div className="getInTouchForm mb-1">
                      <input
                        name="mobile"
                        type="text"
                        placeholder="Mobile Number*"
                        value={inquiryForm.mobile}
                        onChange={handleInputMobile}
                        autoComplete="off"
                      />
                    </div>
                    <div className="getInTouchForm mb-1">
                      <input
                        name="email"
                        type="text"
                        placeholder="Email ID*"
                        value={inquiryForm.email}
                        onChange={handleInputData}
                        autoComplete="off"
                      />
                    </div>
                    <div className="getInTouchForm mb-1">
                      {/* {console.log(InquiryType)} */}
                      <Select
                      className="select_2"
                        name="state"
                        value={
                          InquiryType.find(
                            (InquiryType) =>
                              InquiryType.value == inquiryForm.issueType
                          ) || null
                        }
                        onChange={handleIssueType}
                        options={InquiryType && InquiryType}
                        placeholder="Select Issue*"
                        isSearchable
                      />
                    </div>
                    <div className="getInTouchForm mb-1">
                      <textarea
                        name="message"
                        type="textarea"
                        placeholder="Message*"
                        rows="5"
                        value={inquiryForm.message}
                        onChange={handleInputData}
                        autoComplete="off"
                      />
                    </div>
                    <button className="submitBtn" type="submit">
                      Submit
                    </button>
                  </form>
                </div>
              </Tab>
              <Tab eventKey="view" title="View Conversation">
                <div className="container-fluid p-0">
                  {/* {console.log("conversationList", conversationList)} */}
                  {!convoDetail ? (
                    conversationList?.length > 0 ? (
                      conversationList.map((item, index) => {
                        return (
                          <div
                            className="mb-3 card conversate_card"
                            key={index}
                          >
                            <div
                              className="issue_msgText p-3"
                              style={{
                                background: "rgba(255, 248, 240, 1)",
                                color: "rgba(255, 116, 38, 1)",
                                borderRadius: "6px 6px  0 0 ",
                              }}
                            >
                              <p className="m-0">{item.message}</p>
                            </div>
                            <div className="card-body position-relative">
                              <p className="m-0 mb-1 item_title">
                                <span>Mobile: </span>
                                {item.mobile}
                              </p>
                              <p className="m-0 mb-1 item_title">
                                <span>Email ID: </span>
                                {item.email}
                              </p>
                              <p className="m-0 issueTitle">
                                <b>
                                  {" "}
                                  <span>Issue: </span>
                                  {item?.type &&
                                    InquiryType.filter(
                                      (issue) => issue.value == item?.type
                                    )[0].label}
                                </b>
                              </p>
                              {/* <div className="viewDetail position-relative">
                                <button
                                  onClick={() => handleViewDetail(item)}
                                  className="viewbtn"
                                >
                                  <Icon.ChevronRight />
                                </button>
                              </div> */}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        {showError ? (
                          <ErrorPageAfterLogin />
                        ) : (
                          <LoaderAfterLogin />
                        )}
                      </>
                    )
                  ) : (
                    <>
                      {/* <div className="row">
                        <div className="col-md-12">
                          <div className="card chatCard">
                            <div className="chat-conversation">
                              <div className="simplebar-content-wrapper">
                                <div className="simplebar-content">
                                  <ul
                                    className="list-unstyled chat-conversation-list"
                                    id="chat-conversation-list"
                                  >
                                    <li className="chat-list left">
                                      <div className="conversation-list">
                                        <div className="user-chat-content">
                                          <h5 className="conversation-name mb-2">
                                            Miranda Valentine
                                          </h5>
                                          <div className="ctext-wrap">
                                            <div className="ctext-wrap-content left-in">
                                              <h4 className="m-0 payIssueTitle">
                                                Issue : Payment Issue
                                              </h4>
                                              <hr className="p_divider" />
                                              <p className="mb-0 ctext-content">
                                                Lorem Ipsum has been the
                                                industry's standard dummy text
                                                ever since the 1500s, when an
                                                printer took a galley of type
                                                and scrambled.
                                              </p>
                                            </div>
                                          </div>
                                          <div className="left-time">
                                            <small
                                              className="dropdown-btn text-muted mb-0 ms-2"
                                              tabindex="0"
                                            >
                                              03:10 PM
                                            </small>
                                            <div className="dropdown-content">
                                              <a href="#">
                                                <i className="bi bi-pin-angle"></i>{" "}
                                                Pin Chat
                                              </a>
                                              <hr className="divider" />
                                              <a href="#">
                                                <i className="bi bi-trash3"></i>{" "}
                                                Delete
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                    <li className="chat-list left">
                                      <div className="conversation-list">
                                        <div className="user-chat-content">
                                          <h5 className="conversation-name mb-2">
                                            Miranda Valentine
                                          </h5>
                                          <div className="ctext-wrap">
                                            <div className="ctext-wrap-content left-in">
                                              <p className="mb-0 ctext-content">
                                                <img
                                                  src="http://localhost/admin/auth_panel_assets/images/audio.png"
                                                  alt=""
                                                />
                                              </p>
                                            </div>
                                          </div>
                                          <div className="left-time">
                                            <small
                                              className="dropdown-btn text-muted mb-0 ms-2"
                                              tabindex="0"
                                            >
                                              03:10 PM
                                            </small>
                                            <div className="dropdown-content">
                                              <a href="#">
                                                <i className="bi bi-pin-angle"></i>{" "}
                                                Pin Chat
                                              </a>
                                              <hr className="divider" />
                                              <a href="#">
                                                <i className="bi bi-trash3"></i>{" "}
                                                Delete
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                    <li className="chat-list right">
                                      <div className="conversation-list">
                                        <div className="user-chat-content">
                                          <h5 className="conversation-name mb-2">
                                            Carl Smith
                                          </h5>
                                          <div className="ctext-wrap">
                                            <div className="ctext-wrap-content">
                                              <p className="mb-0 ctext-content">
                                                Lorem Ipsum has been the
                                                industry's standard dummy text
                                                ever since the 1500s, when an.
                                              </p>
                                            </div>
                                          </div>
                                          <div className="right-time">
                                            <small className="text-muted mb-0 me-2">
                                              03:10 PM
                                            </small>
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                    <li className="chat-list right">
                                      <div className="conversation-list">
                                        <div className="user-chat-content">
                                          <h5 className="conversation-name mb-2">
                                            Carl Smith
                                          </h5>
                                          <div className="ctext-wrap">
                                            <div className="ctext-wrap-content">
                                              <p className="mb-0 ctext-content">
                                                Lorem Ipsum has been the
                                                industry's standard dummy text
                                                ever since the 1500s, when an.
                                              </p>
                                            </div>
                                          </div>
                                          <div className="right-time">
                                            <small className="text-muted mb-0 me-2">
                                              03:10 PM
                                            </small>
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="chat_input py-3 pb-0">
                              <div class="input-group">
                                <span class="py-0 input-group-text border-0 bg-white">
                                  <i class="paperIcon bi bi-paperclip"></i>
                                </span>
                                <input
                                  type="text"
                                  className="px-0 border-0 input_field form-control"
                                  placeholder="Type Somthing...."
                                />
                                <span class="py-0 input-group-text border-0 bg-white">
                                  <i class="micIcon bi bi-mic-fill"></i>
                                </span>
                              </div>
                              <button className="btn Btn_warning">
                                <i
                                  className="bi bi-send-fill"
                                  style={{ fontsize: "20px" }}
                                ></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div> */}
                    </>
                  )}
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Inquiry;
