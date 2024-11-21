import { isValidData } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import ErrorPage from "../errorPage";
import Loader from "../loader";
import ComboCourseCard from "../cards/comboCourseCard";
import { useRouter } from "next/router";

const ComboCourse = ({
  courseDetail,
  CourseID,
  tabName,
  keyValue,
  titleName,
  onlineCourseAry,
}) => {
  // console.log('CombocourseDetail', courseDetail)
  const [checkLogin, setCheckLogin] = useState("");

  const router = useRouter();
  useEffect(() => {
    const token = router.asPath;
    setCheckLogin(token.startsWith("/private/myProfile"));
  }, []);

  useEffect(() => {}, [checkLogin]);
  const dataAry = courseDetail?.meta?.list;
  return (
    <div
      className={`comboCourse_cardContainer ${
        checkLogin ? "onlineCourse" : ""
      } px-5 px-sm-1 mb-3`}
    >
      <div className="row m-0">
        <div
          className={`${
            !checkLogin ? "col-lg-8 offset--1 col-md-12" : "col-md-12 nn"
          }  `}
        >
          <div className="row">
            {isValidData(dataAry) ? (
              dataAry.map((item, index) => {
                return (
                  <ComboCourseCard
                    value={item}
                    titleName={titleName}
                    key={index}
                    CourseID={CourseID}
                    classNamed={true}
                    onlineCourseAry={onlineCourseAry}
                  />
                );
              })
            ):
            <ErrorPage />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboCourse;
