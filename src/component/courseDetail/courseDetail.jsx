import React, { useEffect, useState } from "react";
import FreeContent from "../freeTest&Course/freeContent";
import OurProduct from "../ourProducts/ourProduct";
import { faculties_Ary, freeTestAry } from "../../../public/assets/sampleArry";

import { comboDetail, isValidData } from "@/utils/helpers";
import CourseReview from "@/component/courseReview/courseReview";
import Button1 from "../buttons/button1/button1";
import { useRouter } from "next/router";

const CourseDetail = ({
  courseDetail,
  propsValue,
  title,
  relateCourseAry,
  course,
  keyValue,
  titleName,
}) => {
  const [active, setActive] = useState(0);
  const [showLang, setShowLang] = useState(false);
  const [lang, setLang] = useState("Hindi");
  const [langData, setLangData] = useState("");
  const [data, setData] = useState("");
  const [description, setDescription] = useState("");
  const [faq, setFaq] = useState("");

  const router = useRouter()

  // console.log("propsValue", courseDetail);
  useEffect(() => {
    if (courseDetail) {
      setFaq(
        courseDetail.filter((item) => item.tile_name == "FAQ")[0]?.meta?.list
      );
      const filteCourseDetail = courseDetail.filter(
        (item) => item.type == "overview"
      );
      // console.log(filteCourseDetail)
      if (filteCourseDetail[0]?.meta?.visibility == "0") {
        setData(filteCourseDetail[0]?.meta?.description);
        setShowLang(true);
        setDescription(filteCourseDetail[0]?.meta?.description);
        setLangData(filteCourseDetail[0]?.meta?.description_2);
      } else if (filteCourseDetail[0]?.meta?.visibility == "1") {
        setDescription(filteCourseDetail[0]?.meta?.description);
      } else if (filteCourseDetail[0]?.meta.visibility == "2") {
        setDescription(filteCourseDetail[0]?.meta?.description_2);
      } else {
        setShowLang("");
      }
      // if(item.visibilty == 1) {
      //   setDescription(
      //     courseDetail.filter((item) => (item.tile_name == "Course Overview" || item.tile_name == "Description"))[0]
      //       ?.meta?.description
      //   )
      // }
      // else if(item.visibilty == 2){
      //   setDescription(
      //     courseDetail.filter((item) => (item.tile_name == "Course Overview" || item.tile_name == "Description"))[0]
      //       ?.meta?.description_2
      //   );
      // }
    }
    // else{
    //   setShowLang(false)
    // }
  }, [courseDetail]);

  const handleChangeLang = () => {
    setLang(lang == "Hindi" ? "English" : "Hindi");
    setDescription(lang == "English" ? data : langData);
  };

  // console.log('hel', langData)

  return (
    <div className="detail-container">
      <section className="py-4 page-section-1">
        {description && (
          <div className="row px-2 m-0">
            <h1 className="head p-0 mb-3">
              {title}
              {langData && (
                <Button1
                  value={`change to ${lang}`}
                  handleClick={handleChangeLang}
                />
              )}
            </h1>
            <div
              className="p-0 detail_desc"
              // contentEditable="true"
              dangerouslySetInnerHTML={{
                __html: description && description.data,
              }}
            ></div>
            {/* <div className="mt-4 detailCourse">{description.data}</div> */}
          </div>
        )}
        {!comboDetail(router.asPath) && <CourseReview courseDetail={course} />}
        {faq && (
          <div className="accorddion_cont p-0 mt-4">
            <h1 className="head m-0 mb-3">Faq's</h1>
            <div className="accordion accordion-flush" id="faqlist">
              {faq.map((item, index) => {
                return (
                  <div className="accordion-item" key={index}>
                    <h2
                      className="accordion-header"
                      onClick={() => setActive(index)}
                    >
                      <button
                        className={`accordion-button ${
                          active !== index && "collapsed"
                        }`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-content-0"
                      >
                        {item.question}
                      </button>
                    </h2>
                    <div
                      id="faq-content-0"
                      className={`accordion-collapse collapse accrdbtn ${
                        active == index && "show"
                      }`}
                      data-bs-parent="#faqlist"
                    >
                      <div className="accordion-body">{item.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
      <section className="py-4 container-fluid page-section-3">
        {/* {console.log('prop', relateCourseAry)} */}
        {isValidData(propsValue) && (
          <div className="row p-0 m-0">
            <div className="col-md-12 p-0">
              <h1 className="head p-0 mb-3">
                Similar{" "}
                {title == "Test Description"
                  ? "Test Series"
                  : title == "Test Description"
                  ? "Books"
                  : "Courses"}
              </h1>
              <FreeContent
                value={isValidData(relateCourseAry) && relateCourseAry}
                titleName="Related Course"
              />
            </div>
          </div>
        )}
      </section>
      <section className="container-fluid page-section-4">
        {
          <>
            <OurProduct value="faculties" data={faculties_Ary} />
          </>
        }
      </section>
    </div>
  );
};

export default CourseDetail;
