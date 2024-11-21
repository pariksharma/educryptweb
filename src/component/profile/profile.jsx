import React, { useEffect, useState } from "react";
import Button1 from "../buttons/button1/button1";
import Button2 from "../buttons/button2/button2";
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  districtListService,
  getMyProfileService,
  stateListService,
  userUpdateProfileService,
} from "@/services";
import { set } from "date-fns";
import { useRouter } from "next/router";
import AWS from 'aws-sdk'
import { useDispatch, useSelector } from "react-redux";
import { profile_data } from "@/store/sliceContainer/masterContentSlice";
import UpdatePasswordModal from "../modal/updatePasswordModal";
import Head from 'next/head';

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const REGION = process.env.NEXT_PUBLIC_S3_REGION;

// AWS.config.update({
//   accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESSKEYID,
//   secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRETKEY
// })

AWS.config.update({
  region: REGION,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-south-1:52721cc8-3b0f-47d4-a23a-50c387baee06',  // Replace with your Cognito Identity Pool ID
  }),
});


// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//   IdentityPoolId: 'ap-south-1:52721cc8-3b0f-47d4-a23a-50c387baee06',  // Replace with your Cognito Identity Pool ID
// });

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
})

const Profile = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [profileImage, setProfileImage] = useState('')
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [updatePasswordModalShow, setUpdatePasswordModalShow] = useState(false);
  const [profileData, setProfileData] = useState('');
  const [state, setState] = useState("");
  const [stateList, setStateList] = useState([]);
  const [city, setCity] = useState("");
  const [cityList, setCityList] = useState([]);
  const [error, setError] = useState("");
  const [acctiveProfile, setacctiveProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    email: "",
    mobile: "",
    state: "",
    city: "",
  });

  const token = get_token();
  const router = useRouter();
  const dispatch = useDispatch();
  const versionData = useSelector((state) => state.allCategory?.versionData);

  useEffect(() => {
    setIsEditProfile(false);
    // fetchMyProfile();
  }, []);
  useEffect(() => {
    if (!isEditProfile) {
      fetchMyProfile()
    }
  }, [isEditProfile])

  useEffect(() => {
    // console.log('rpofileData', profileData)
    if (profileData != "") {
      fetchStateList();
    }
  }, [profileData, isEditProfile]);

  useEffect(() => {
    // console.log('state', stateList)
    if (stateList != "") {
      fetchCityList(profileData);
    }
  }, [stateList]);

  useEffect(() => {
    if (editProfileData.state != "") {
      fetchCityList(editProfileData);
    }
  }, [editProfileData.state]);

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false)
      }, 1500)
    }
  }, [isToasterOpen])


  const handleEdit = () => {
    setIsEditProfile(true);
  };

  const validateEmail = (email) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputMobile = (event) => {
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
      setEditProfileData({ ...editProfileData, mobile: newNumber });
      setError(
        validateIndianNumber(newNumber) ? "" : "Invalid Indian number format"
      );
    }
  };

  const validateIndianNumber = (number) => {
    // Regular expression for Indian mobile numbers starting with 6-9
    const mobileRegex = /^[6-9]\d{9}$/;

    return mobileRegex.test(number);
  };

  const handleEditForm = (e) => {
    const { name, value } = e.target;
    // console.log("e", e.target.value);
    setEditProfileData({
      ...editProfileData,
      [name]: value,
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (
      editProfileData.name &&
      editProfileData.email &&
      validateEmail(editProfileData.email) &&
      /^[a-zA-Z\s]+$/.test(editProfileData.name) &&
      editProfileData.state &&
      editProfileData.city
    ) {
      fetchUpdateProfile();
    } else {
      if (!editProfileData.name) {
        toast.error("Please, Enter your name");
      } else if (!/^[a-zA-Z\s]+$/.test(editProfileData.name)) {
        toast.error("Name didn't contain a number or special character");
      } else if (!editProfileData.state) {
        toast.error("Please, select your state");
      } else if (!editProfileData.city) {
        toast.error("Please, select your city");
      }
    }
  };

  const fetchUpdateProfile = async () => {
    try {
      const formData = {
        name: editProfileData.name,
        // email : editProfileData.email,
        state: editProfileData?.state?.id
          ? editProfileData.state.id
          : editProfileData.state,
        city: editProfileData?.city?.id
          ? editProfileData.city.id
          : editProfileData.city,
        profile_picture: profileImage,
      };
      // console.log(formData)

      const response_updateProfile_service = await userUpdateProfileService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_updateProfile_data = decrypt(
        response_updateProfile_service.data,
        token
      );
      // console.log("checked", editProfileData, response_updateProfile_data);
      if (response_updateProfile_data.status) {
        // if (response_updateProfile_data?.message) {
        // console.log("response_updateProfile_data.message",response_updateProfile_data.message)
        toast.success(response_updateProfile_data.message);

        // }
        setIsEditProfile(false)
        //   localStorage.removeItem('jwt');
        //   localStorage.removeItem('user_id');
        //   router.push('/')
      }
      else {
        if (response_updateProfile_data.message == msg) {
          if (response_updateProfile_data.message) {
            toast.error(response_updateProfile_data.message);
          }
          setTimeout(() => {
            localStorage.removeItem("jwt");
            localStorage.removeItem("user_id");
            if (router.pathname.startsWith("/private")) {
              router.push("/");
            } else location.reload();
          }, 2000);
        }
        else {
          toast.error(response_updateProfile_data.message);
        }
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  const fetchMyProfile = async () => {
    try {
      const formData = {};
      const response_getMyProfile_service = await getMyProfileService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getMyProfile_data = decrypt(
        response_getMyProfile_service.data,
        token
      );
      // console.log('response_getMyProfile_data', response_getMyProfile_data)
      if (response_getMyProfile_data.status) {
        setProfileData(response_getMyProfile_data.data);
        setEditProfileData({
          ...editProfileData,
          name: response_getMyProfile_data.data.name,
          email: response_getMyProfile_data.data.email,
          mobile: response_getMyProfile_data.data.mobile,
          // state: response_getMyProfile_data?.data?.state
        });
        setProfileImage(response_getMyProfile_data.data.profile_picture)
        dispatch(profile_data(response_getMyProfile_data.data))
        // localStorage.setItem('username', response_getMyProfile_data?.data?.name)
      }
    } catch (error) {
      // console.log("error found: ", error)
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
      // console.log('response_stateList_data', response_stateList_data)
      if (response_stateList_data.status) {
        setStateList(response_stateList_data.data);
        setState(
          response_stateList_data.data.filter(
            (item) => item.id == profileData.state
          )
        );
        setEditProfileData({
          ...editProfileData,
          state: response_stateList_data.data.filter(
            (item) => item.id == profileData.state
          )[0],
        });
      }
    } catch (error) {
      console.log("error found: ", error)
    }
  };

  const fetchCityList = async (val) => {
    try {
      const formData = {
        state_id: val.state,
      };
      // console.log('state_id', val)
      const response_districtList_service = await districtListService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_districtList_data = decrypt(
        response_districtList_service.data,
        token
      );
      // console.log('response_CityList_data', cityList)
      if (response_districtList_data.status) {
        setCityList(response_districtList_data.data);
        setCity(
          response_districtList_data.data.filter((item) => item.id === val.city)
        );
        setEditProfileData({
          ...editProfileData,
          city: response_districtList_data.data.filter(
            (item) => item.id == val.city
          )[0],
        });
      }
      // console.log('response_CityList_data', city)
    } catch (error) {
      console.log("error found: ", error)
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("file",file)
    if (file) {
      setSelectedFile(file);
      uploadFile(file)
      // setProfileImage(imageUrl);
    }
  };

  const handleCameraClick = () => {
    document.getElementById('fileInput').click();
  };

  const uploadFile = (file) => {
    console.log('file', file)
    const params = {
      ACL: 'public-read',
      Body: file,
      Bucket: S3_BUCKET,
      Key: file.name,
    };

    myBucket.putObject(params)
      .on('httpUploadProgress', (evt) => {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      })
      .send((err) => {
        if (err) {
          console.log(err);
        } else {
          const uploadedImageUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${file.name}`;
          setProfileImage(uploadedImageUrl);  // Set the uploaded image URL
          console.log('File uploaded successfully. URL:', uploadedImageUrl);
        }
      });
  };

  // console.log('isToasterOpen', isToasterOpen)

  return (
    <>

       <Head>
        <title>{'Profile'}</title>
        <meta name={'Profile'} content={'Profile'} />
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
      {/* <Toaster position="top-right" reverseOrder={false} style={{}} /> */}
      <UpdatePasswordModal
        show={updatePasswordModalShow}
        onHide={() => setUpdatePasswordModalShow(false)}
      />
      {!isEditProfile ? (
        <section className="container-fluid">
          <div className="card accountCard mt-1">
            <div className="row">
              <div className="col-md-12">
                <h4 className="m-0 profile_Title">Profile</h4>
              </div>
              <div className="col-md-3">
                <img
                  className="accountImg my-4"
                  src={`${profileData.profile_picture ? profileData.profile_picture : '/assets/images/profile.png'}`}
                  alt=""
                />
              </div>
              <div className="col-md-9">
                <div className="row">
                  <div className="col-sm-6 col-md-4 mb-4">
                    <h4 className="m-0 p_ac_Title">Name</h4>
                  </div>
                  <div className="col-sm-6 col-md-8 mb-4">
                    <p className="m-0 user_Detail">
                      {profileData && profileData.name}
                    </p>
                  </div>
                  <div className="col-sm-6 col-md-4 mb-4">
                    <h4 className="m-0 p_ac_Title">Email</h4>
                  </div>
                  <div className="col-sm-6 col-md-8 mb-4">
                    <p className="m-0 user_Detail">
                      {profileData && profileData.email}
                    </p>
                  </div>
                  <div className="col-sm-6 col-md-4 mb-4">
                    <h4 className="m-0 p_ac_Title">Mobile Number</h4>
                  </div>
                  <div className="col-sm-6 col-md-8 mb-4">
                    <p className="m-0 user_Detail">
                      {profileData?.c_code ?
                        `${profileData.c_code} ${profileData.mobile}`
                        : `+91 ${profileData.mobile}`}
                    </p>
                  </div>
                  <div className="col-sm-6 col-md-4 mb-4">
                    <h4 className="m-0 p_ac_Title">State/City</h4>
                  </div>
                  <div className="col-sm-6 col-md-8 mb-4">
                    <p className="m-0 user_Detail">
                      {/* {console.log('stateList', state)} */}
                      {state?.length > 0 ?
                        state.map((item, index) => {
                          return (
                            <td key={index}>
                              {item.name}
                              {city &&
                                city.map((val) => {
                                  return `/${val.name}`;
                                })}
                            </td>
                          );
                        })
                        :
                        <td>{profileData?.state}/{profileData.city}</td>
                      }
                    </p>
                  </div>
                  <div className="mt-3 col-sm-6 d-flex gap-2 col-md-4">
                    <Button1 value={"Edit"} handleClick={handleEdit} />
                    {versionData?.otp_login != 1 && <Button2 value={"Update Password"} handleClick={() => setUpdatePasswordModalShow(true)} />}
                  </div>
                  <div className="mt-3 col-sm-6 col-md-8"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <nav aria-label="breadcrumb ">
            <ol className="breadcrumb mb-2 cursor">
              <li
                className="breadcrumb-item"
                onClick={() => setIsEditProfile(false)}
              >
                <Icon.ChevronLeft />
                {`Back`}
              </li>
            </ol>
          </nav>
          <section className="container-fluid">
            <div className="card accountCard mt-1">
              <div className="row">
                <div className="col-md-12">
                  <h4 className="profile_Title">Edit Profile</h4>
                </div>
                <div className="col-md-3 position-relative">
                  <img
                    className="accountImg my-3"
                    src={`${profileImage ? profileImage : (profileData.profile_picture ? profileData.profile_picture : '/assets/images/profile.png')}`}
                    alt=""
                  />
                  <img
                    className="cameraImg"
                    src="/assets/images/cameraImg.svg"
                    alt=""
                    onClick={handleCameraClick}
                  />
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                </div>
                <div className="col-md-9">
                  <form
                    className="row profile_Editform"
                    onSubmit={handleProfileSubmit}
                  >
                    <div className="col-md-12 mb-3">
                      <label>Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        value={editProfileData.name}
                        placeholder={editProfileData && editProfileData.name}
                        onChange={handleEditForm}
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label>Email</label>
                      <input
                        disabled
                        className="form-control"
                        type="text"
                        name="email"
                        value={editProfileData.email}
                        placeholder={editProfileData && editProfileData.email}
                        onChange={handleEditForm}
                        autoComplete="off"
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label>Mobile Number</label>
                      <input
                        disabled
                        type="tel"
                        name="mobile"
                        className="form-control"
                        placeholder={editProfileData && editProfileData.mobile}
                        value={editProfileData.mobile}
                        onChange={handleInputMobile}
                      />
                    </div>

                    <div className="col-md-12 mb-3">
                      <label>State</label>
                      <select
                        className="form-control"
                        id="state"
                        name="state"
                        value={editProfileData && editProfileData?.state?.name}
                        onChange={handleEditForm}
                        autoComplete="off"
                      >
                        <option
                          value={
                            editProfileData && editProfileData?.state?.name
                          }
                          disabled
                        >
                          {editProfileData && editProfileData?.state?.name}
                        </option>
                        {stateList &&
                          stateList.map((item, i) => {
                            return (
                              <option value={item.id} key={i}>
                                {item.name}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                    <div className="col-md-12 mb-3">
                      <label>City</label>
                      <select
                        className="form-control"
                        id="city"
                        name="city"
                        value={editProfileData && editProfileData?.city?.name}
                        onChange={handleEditForm}
                        autoComplete="off"
                      >
                        <option
                          value={editProfileData && editProfileData?.city?.name}
                          disabled
                        >
                          {editProfileData && editProfileData?.city?.name}
                        </option>
                        {cityList &&
                          cityList.map((item, i) => {
                            return (
                              <option value={item.id} key={i}>
                                {item.name}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                    <div className="editButton d-flex">
                      <button className="me-2 btn primaryBtn" type="submit">
                        Save
                      </button>
                      <Button2
                        value={"Cancel"}
                        handleClick={() => setIsEditProfile(false)}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default Profile;
