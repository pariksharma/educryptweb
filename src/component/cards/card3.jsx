import React, { useState } from "react";
import Button1 from "../buttons/button1/button1";
import Button2 from "../buttons/button2/button2";
import { IoStar } from "react-icons/io5";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { FaRupeeSign } from "react-icons/fa";
import { useRouter } from "next/router";
import { userLoggedIn } from "@/utils/helpers";
import LoginModal from "../modal/loginModal";

const content_image = "/assets/images/slideImg.png";
const content_title = "Selection Hi Jawab Hai Something Special For VCAINS";

const Card3 = ({ value, titleName, courseCombo, handleAddToMyCourse }) => {
  const [modalShow, setModalShow] = useState(false);
  const router = useRouter();
  // console.log("value", value);

  const handleExplore = () => {
    router.push(
      `/view-courses/details/${
        titleName + ":" + value.id + "&" + courseCombo + "parent:"
      }`
    );
  };

  const handleBuy = () => {
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      const currentPath = router.asPath;
      localStorage.setItem("redirectAfterLogin", currentPath);

      localStorage.setItem("previousTab", router.pathname);
      router.push(
        `/view-courses/course-order/${
          titleName + ":" + value.id + "&" + courseCombo
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
      <div className={`card border-0 shadow-lg mb-3 p-3 ${value?.cat_type == 0 && 'detail-rightCard'} m-3`}>
        {value && <p className="detailStripe">New</p>}
        <div className="d-flex justify-content-center">
          <img
            style={{ borderRadius: "10px" }}
            src={
              value?.cat_type == 1
                ? value?.cover_image
                : (value?.desc_header_image
                ? value?.desc_header_image
                : "/assets/images/noImage.jfif")
            }
            className={`${
              value?.cat_type == 1 ? "coverImg" : "bookStoreImg flex-fill"
            }`}
            alt="..."
          />
        </div>
        {/* <div className="m-0 free-badge">FREE</div> */}
        <div className="card-body pt-2 px-0 pb-0">
          <h6 className="m-0 mb-2 slideTitle">{value?.title}</h6>
          <div className="courserate">
            <div className="d-flex align-items-center">
              <span className="rating">
                <IoStar />{" "}
                {value.avg_rating
                  ? parseFloat(value.avg_rating).toFixed(1)
                  : "0.0"}
              </span>
              <p className="m-0 review">
                {value.user_rated ? value.user_rated : 0} reviews
              </p>
            </div>
            {value?.mrp == 0 && <p className="m-0 freeStripe">Free</p>}
          </div>
          {/* {value?.mrp == 0 && <p className="m-0 freeStripe">Free</p>} */}
        </div>
        {value?.cat_type != 1 && (
          <>
            <p className="my-2 d-flex align-items-center validity">
              <img
                className="calendarDate2 me-1"
                src="/assets/images/calendarDate2.svg"
                alt=""
              />
              Validity:
              <span className="ms-2 valid_date">{`${value.validity}`}</span>
            </p>
          </>
        )}
        <hr className="dotted-divider" />
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

          {value.is_purchased != 0 ? (
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
            <div className="myCourseBtn d-flex flex-wrap flex-lg-nowrap gap-2">
              <Button1 widthFull={true} value={"Buy Now"} handleClick={handleBuy} />
            </div>
          )}
      </div>
    </>
  );
};

export default Card3;
