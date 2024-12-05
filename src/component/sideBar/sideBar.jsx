import { getCourse_Catergory_Service } from "@/services";
import { all_content } from "@/store/sliceContainer/masterContentSlice";
import { decrypt, get_token } from "@/utils/helpers";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Nav } from "react-bootstrap";
import { useDispatch } from "react-redux";
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";

const SideBar = () => {
  const router = useRouter();
  const { tab } = router.query;

  const [statusTab, setStatusTab] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);
  const [sideBarTabs, setSideBarTabs] = useState([]);

  const handleSidebar = () => {
    setOpenSidebar((prevState) => !prevState);
  };

  const dispatch = useDispatch();
  // console.log('tab', tab)
  // console.log('statusTab', router.asPath.substring((router.asPath.lastIndexOf('detail/')) +7, router.asPath.lastIndexOf(':')))

  useEffect(() => {
    fetchContentData();
  }, []);

  useEffect(() => {
    if (tab) {
      setStatusTab(tab);
    } else {
      const nameTab = localStorage.getItem('redirectdetails')?.substring(
        localStorage.getItem('redirectdetails').lastIndexOf("myProfile/") + 10,
        localStorage.getItem('redirectdetails').length
      );
      // console.log("nameTab", nameTab);
      if (
        nameTab == "Classroom%20Learning%20Program" ||
        nameTab == "Online%20Courses" ||
        nameTab == "Test%20Series" ||
        nameTab == "e-BOOK"
      ) {
        setStatusTab("ourCourse");
      } else {
        setStatusTab(nameTab);
      }
      // console.log('nameTab', nameTab)
    }
  }, [tab, sideBarTabs]);

  const token = get_token();
  const fetchContentData = async () => {
    try {
      const formData = new FormData();
      const response_content_service = await getCourse_Catergory_Service(
        formData
      );
      // console.log(
      //   "bannerResponse1",
      //   decrypt(response_content_service.data, token)
      // );
      const content_service_Data = decrypt(
        response_content_service.data,
        token
      );
      // console.log("content_service_Data", content_service_Data);
      if (content_service_Data?.status) {
        dispatch(all_content(content_service_Data?.data));
        setSideBarTabs(content_service_Data?.data?.bottom_bar_web);
      }
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  return (
    <div className="d-flex" >
      <div>
        <div className="closeSidebar closeSidebarTop mx-3 py-1">
          <button
            className="btn p-0"
            onClick={handleSidebar}
            style={{ fontSize: "25px" }}
          >
            <Icon.List />
          </button>
        </div>
        <Nav
          id="sidebar"
          className={`pt-2 bg-light ${openSidebar ? "d-none" : "d-block"}`}
          activeKey="/home"
          onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
        >
          <div className="innerSideBarDiv">
            <div className="closeSidebar mx-3 py-1">
              <button className="btn" onClick={handleSidebar}>
                &times;
              </button>
            </div>
            {sideBarTabs?.length > 0 &&
              sideBarTabs.map((value, index) => {
                if (value.title == "Feeds") {
                  return (
                    <Nav.Item
                      key={index}
                      onClick={() => {
                        router.push({
                          pathname: `/private/myProfile/${value?.type}`,
                          query: {
                            title: value.title,
                          }
                        });
                        localStorage.removeItem('mainTab')
                      }
                      }
                      className={`m-0 ${
                        statusTab && (statusTab == value?.title?.split(" ").join("_") ? " active" : "")
                      }`}
                    >
                      <Nav.Link className="m-0">
                        <img src={value.icon} alt="" />
                        {value.title}
                      </Nav.Link>
                    </Nav.Item>
                  );
                }
              })}
            <div className="sidebar-header">
              <h4 className="m-0">STUDY MATERIAL</h4>
            </div>
            <Nav.Item
              // onClick={() => setStatusTab("ourCourse")}
              onClick={() => {
                  router.push("/private/myProfile/ourCourse")
                  localStorage.removeItem('mainTab')
                }
              }
              className={`m-0 ${
                statusTab && (statusTab == "ourCourse" ? "active" : "")
              }`}
            >
              <Nav.Link className="m-0">
                <img src="/assets/images/ourCourseLogo.png" alt="" />
                Our Courses
              </Nav.Link>
            </Nav.Item>
            {sideBarTabs &&
              sideBarTabs.map((value, index) => {
                if (
                  value.title !== "Feeds" &&
                  value.title !== "Inquiry" &&
                  value.title !== "Testimonial" &&
                  value.title !== "Notice Board" &&
                  value.title !== "Single Course" &&
                  value.title !== "All courses"
                ) {
                  return (
                    <Nav.Item
                      key={index}
                      onClick={() => {
                          // router.push(`/private/myProfile/${value?.type}`)
                          router.push({
                            pathname: `/private/myProfile/${value?.type}`,
                            query: {
                              title: value.title,
                            }
                          });
                          localStorage.removeItem('mainTab')
                        }
                      }
                      className={`m-0 ${
                        statusTab && (statusTab == value?.type ? "active" : "")
                      }`}
                    >
                      <Nav.Link className="m-0">
                        <img src={value.icon} alt="" />
                        {value.title}
                      </Nav.Link>
                    </Nav.Item>
                  );
                }
              })}
            <Nav.Item
              // onClick={() => setStatusTab("Notification")}
              onClick={() => {
                  router.push("/private/myProfile/notification")
                  localStorage.removeItem('mainTab')
                }
              }
              className={`m-0 ${
                statusTab && (statusTab == "notification" ? "active" : "")
              }`}
            >
              <Nav.Link className="m-0">
                <img src="/assets/images/notificationLogo.png" alt="" />
                Notification
              </Nav.Link>
            </Nav.Item>
            <div className="sidebar-header">
              <h4 className="m-0">MY STUFF</h4>
            </div>
            <Nav.Item
              // onClick={() => setStatusTab("MyCourse")}
              onClick={() => {
                  router.push("/private/myProfile/myCourse")
                  localStorage.removeItem('mainTab')
                }
              }
              className={`m-0 ${
                statusTab && (statusTab == "myCourse" ? "active" : "")
              }`}
            >
              <Nav.Link className="m-0">
                <img src="/assets/images/myCourseLogo.png" alt="" />
                My Courses
              </Nav.Link>
            </Nav.Item>
            <Nav.Item
              onClick={() => {
                  router.push("/private/myProfile/purchase-history")
                  localStorage.removeItem('mainTab')
                }
              }
              className={`m-0 ${
                statusTab && (statusTab == "purchase-history" ? "active" : "")
              }`}
            >
              <Nav.Link className="m-0">
                <img src="/assets/images/purchaseLogo.png" alt="" />
                Purchase History
              </Nav.Link>
            </Nav.Item>
            {sideBarTabs &&
              sideBarTabs.map((value, index) => {
                if (value?.type == "12" || value?.type == "31") {
                  return (
                    <Nav.Item
                      key={index}
                      onClick={() => {
                          // router.push(`/private/myProfile/${value?.type}`)
                          router.push({
                            pathname: `/private/myProfile/${value?.type}`,
                            query: {
                              title: value.title,
                            }
                          });
                          localStorage.removeItem('mainTab')
                        }
                      }
                      className={`m-0 ${
                        statusTab && (statusTab == value?.type ? "active" : "")
                      }`}
                    >
                      <Nav.Link className="m-0">
                        <img src={value.icon} alt="" />
                        {value.title}
                      </Nav.Link>
                    </Nav.Item>
                  );
                }
              })}
            <Nav.Item
              // onClick={() => setStatusTab("profile")}
              onClick={() => {
                  router.push("/private/myProfile/profile")
                  localStorage.removeItem('mainTab')
                }
              }
              className={`m-0 ${
                statusTab && (statusTab == "profile" ? "active" : "")
              }`}
            >
              <Nav.Link className="m-0">
                <img src="/assets/images/myProfileLogo.png" alt="" />
                Profile
              </Nav.Link>
            </Nav.Item>
          </div>
        </Nav>
      </div>
    </div>
  );
};

export default SideBar;
