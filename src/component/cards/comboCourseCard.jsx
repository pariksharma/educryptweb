import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const ComboCourseCard = ({
  value,
  titleName,
  key,
  CourseID,
  onlineCourseAry,
  classNamed,
}) => {
  const router = useRouter();
  const [checkLogin, setCheckLogin] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    setCheckLogin(token !== null && token !== "");
  }, []);

  useEffect(() => {}, [checkLogin]);

  // console.log('onlineCourseAry', onlineCourseAry)
  const handleDetail = () => {
    if (onlineCourseAry.is_purchased != 0) {
      router.push(
        `/private/myProfile/detail/${
          'combo_course' + ":" + value.id + "&" + "" + "parent:" + onlineCourseAry.id
        }`
      );
    } else {
      if (onlineCourseAry?.combo_course_ids) {
        router.push(
          `/view-courses/course-order/${
            titleName +
            ":" +
            onlineCourseAry.id +
            "&" +
            onlineCourseAry.combo_course_ids
          }`
        );
      } else {
        router.push(
          `/view-courses/course-order/${
            titleName + ":" + onlineCourseAry.id + "&" + ""
          }`
        );
      }
    }
  };
  // console.log('CourseID', value)
  return (
    <div
      className={`${checkLogin ? "col-md-4 my-3 px-2" : "col-md-4 my-3 px-2"}`}
      //   style={checkLogin ? {} : { width: "320px" }}
    >
      <div
        className={`${
          checkLogin ? "" : "freeCard"
        } card border-0  b-radius p-2 h-100 `}
        onClick={handleDetail}
      >
        {
          <img
            style={{ borderRadius: "10px" }}
            src={
              value?.desc_header_image
                ? value.desc_header_image
                : "/assets/images/noImage.jfif"
            }
            className="card-img-top"
            alt="..."
          />
        }
        <div className="card-body pt-1 px-0 pb-0">
          <h6 className="mb-0 slideTitle">{value?.title}</h6>
          <div className="courserate1">
            <div className="d-flex1">
              <div className="courseValidity1">
                <span className="validity1">{value.segment_information}</span>
              </div>
              {/* <div className="courseRemaining1">
                        <span className="remaining"><p>Remaining </p></span>
                    </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboCourseCard;
