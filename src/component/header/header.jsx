import React, { useEffect, useRef, useState,useCallback } from "react";
import Button1 from "../buttons/button1/button1";
import { useRouter } from "next/router";
import LoginModal from "../modal/loginModal";
import { Nav, NavDropdown } from "react-bootstrap";
import LogoutModal from "../modal/logoutModal";
import { getCourse_Catergory_Service, getCourse_service, getMyProfileService, getVersionService } from "@/services";
import { decrypt, encrypt, get_token, userLoggedIn } from "@/utils/helpers";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { all_CategoryAction, all_version, profile_data } from "@/store/sliceContainer/masterContentSlice";

const Header = ({ search,IsHome }) => {
  const [modalShow, setModalShow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutShow, setLogoutShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setloading] = useState(false);
  const [searchCourseList, setSearchCourseList] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [logo, setLogo] = useState('')
  const [userData, setUserData] = useState("");
  const [appId, setAppId] = useState('');
  const state = useSelector((state) => state?.appDetail?.app_detail);
  const router = useRouter();
  const token = get_token();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null); 

  const dispatch = useDispatch()

  const userName = useSelector((state) => state?.allCategory?.profileDetail)

  useEffect(() => {
    setAppId(localStorage.getItem('appId'))
    const login = localStorage.getItem("jwt");
    login && setIsLoggedIn(true);
    login && fetchMyProfile();
    const isLogo = localStorage.getItem('logo');
    isLogo && setLogo(isLogo)
    fetchContentData()
    setIsVisible(false)
  }, []);

  useEffect(() => {
    localStorage.setItem('userName', userName.name)
    localStorage.setItem('userMobile', userName.mobile)
  }, [userName])

  const UserLoggedIn = () => {
    const login = localStorage.getItem("jwt");
    return login;
  }

  useEffect(() => {
    UserLoggedIn()
    setIsLoggedIn(UserLoggedIn())
  })

  useEffect(() => {
    getVersion();
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsVisible(false); // Hide the div when clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  useEffect(() => {
    setloading(true)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      if (searchInputValue) {
        fetchSearchCourse(searchInputValue);
        setIsVisible(true);
        setloading(false)
      } else {
        setIsVisible(false);
      }
    }, 500); 
    return () => {
      clearTimeout(debounceTimeout.current);
    };
  }, [searchInputValue]);

  const handleClick = () => {
    setModalShow(true);
  };

  const fetchMyProfile = useCallback(async () => {
    try {
      const response = await getMyProfileService(encrypt("{}", token));
      const profileData = decrypt(response.data, token);
      if (profileData.status) {
        setUserData(profileData.data)
        dispatch(profile_data(profileData.data));
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  }, [dispatch, token]);

  const fetchSearchCourse = useCallback(async (value) => {
    try {
      if (value) {
        const formData = {
          page: 1,
          search: value,
          main_cat: 0,
          sub_cat: 1,
          course_type: 0,
        };
        const response_getCourses_service = await getCourse_service(encrypt(JSON.stringify(formData), token))
        const response_getCourses_data = decrypt(response_getCourses_service.data, token);
        if (response_getCourses_data.status) {
          setSearchCourseList(response_getCourses_data.data)
        }
        else {
          setSearchCourseList([])
        }
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }, [dispatch, token]);

  const handleSearchCourseDetail = (value) => {
    router.push(
      `/view-courses/details/${"" + ":" + value.id + "&" + value.combo_course_ids + 'parent:'
      }`
    );
  }

  const handleRemoveSearch = () => {
    setSearchInputValue('')
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input when the button is clicked
    }
  }

  const fetchContentData = useCallback(async () => {
    try {
      const response = await getCourse_Catergory_Service(new FormData());
      const data = decrypt(response.data, token);
      if (data.status) {
        dispatch(all_CategoryAction(data.data));
      }
    } catch (error) {
      console.error("Error fetching content data:", error);
    }
  }, [dispatch, token]);

  const getVersion = useCallback(async () => {
    try {
      const response = await getVersionService(encrypt("{}", token));
      const versionData = decrypt(response.data, token);
      if (versionData.status) {
        dispatch(all_version(versionData.data.permissions));
      }
    } catch (error) {
      console.error("Error fetching version:", error);
    }
  }, [dispatch, token]);

  const handleRedirect = () => {
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      router.push('/private/myProfile/ourCourse')
    }
    else {
      router.push("/")
    }
  }


  return (
    <nav
      className={`${
        IsHome ? "_IsHome_" : "mainNavShadow fixed-top"
      } px-0 px-sm-5 px-md-5 navbar navbar-expand bg-white `}
      id="eduNav"
      style={{ zIndex: "999" }}
    >
      <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
      <LogoutModal
        show={logoutShow}
        onHide={() => {
          setLogoutShow(false);
        }}
      />
      <div className="container-fluid">
        <div className="m-0 logoImgContainer">
          <img
            className={appId != 655 ? "logoImg" : "logoImg2"}
            src={logo ? logo : state.logo}
            alt=""
            onClick={handleRedirect}
            style={{ cursor: "pointer" }}
          />
        </div>
        {!router.pathname.startsWith("/private") && search !== "disable" && (
          <div
            className="input-group mx-2 search flex-nowrap"
            onClick={() => setIsVisible(true)}
          >
            <span
              className="searchIcon  d-md-block input-group-text border-0"
              id="basic-addon1"
            >
              <img
                loading="lazy"
                src="/assets/images/search-icon.svg"
                alt=""
                style={{ width: "12px" }}
              />
            </span>
            <input
              type="text"
              className=" d-md-block searchBar"
              placeholder="What are you looking for..."
              aria-label="Username"
              aria-describedby="basic-addon1"
              onChange={(e) => setSearchInputValue(e.target.value)}
              value={searchInputValue}
              ref={inputRef}
            />
            <span
              className="searchIcon d-none d-md-block input-group-text border-0"
              style={{
                borderTopRightRadius: "5px",
                borderBottomRightRadius: "5px",
              }}
              id="basic-addon1"
            >
              {searchInputValue && (
                <img
                  loading="lazy"
                  src="/assets/images/searchRemove.svg"
                  alt=""
                  style={{ width: "12px" }}
                  onClick={handleRemoveSearch}
                />
              )}
            </span>
            {isVisible && searchInputValue && (
              <ul
                ref={searchRef}
                className="px-2 py-3 list-unstyled searchDropDown"
              >
                {!loading ? (
                  searchCourseList.length > 0 ? (
                    searchCourseList.map((item, index) => {
                      return (
                        <li
                          className="mb-2 d-flex align-items-center"
                          key={index}
                          onClick={() => handleSearchCourseDetail(item)}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            className="listImg"
                            src={item.cover_image && item.cover_image}
                            alt=""
                          />
                          <p className="m-0 list_Title">{item.title}</p>
                          <img
                            className="ms-4 my-3 redirectImg"
                            src="/assets/images/redirectLogo.png"
                            alt=""
                          />
                          <div className="clearfix"></div>
                        </li>
                      );
                    })
                  ) : (
                    <>
                      <p className="m-0">No Course Found</p>
                    </>
                  )
                ) : (
                  <div className="row align-items-center justify-content-center sldr_container">
                    <div className="spinner-border" role="status" />
                  </div>
                )}
              </ul>
            )}
          </div>
        )}
        {!isLoggedIn ? (
          <div className="navbar-collapse">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Button1 value="Login/Register" handleClick={handleClick} />
              </li>
            </ul>
          </div>
        ) : (
          <div className="profile_cont d-flex">
            {userName.name && (
              <p className="headerUserName mb-0" title={userName.name}>
                {userName.name ? "Hi" : ""} {userName.name}
              </p>
            )}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                id="dropdown-custom-components"
                className="p-0 avatar"
                // title="bhotopp"
              >
                <img
                  loading="lazy"
                  src={
                    userData?.profile_picture
                      ? userData?.profile_picture
                      : "/assets/images/loginLogo.png"
                  }
                  alt="user pic"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                  }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item
                  eventKey={1.1}
                  onClick={() => router.push("/private/myProfile/profile")}
                >
                  <img
                    loading="lazy"
                    className="list_Icon"
                    src="/assets/images/user1.png"
                    alt=""
                  />
                  My Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  eventKey={1.3}
                  onClick={() => setLogoutShow(true)}
                >
                  <img
                    loading="lazy"
                    className="list_Icon"
                    src="/assets/images/logout.png"
                    alt=""
                  />
                  LogOut
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </div>
    </nav>
  );
};

export default React.memo(Header);
