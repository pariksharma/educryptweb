import { getCourse_service } from "@/services";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import Card3 from "../cards/card3";
import Card1 from "../cards/card1";
import ErrorPage from "../errorPage";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import LoaderAfterLogin from "../loaderAfterLogin";

const SubTabsData = ({data, handleDetail, keyValue, getCourses, showError}) => {



  // console.log('keyValue', data)
    // const [getCourses, setGetCourses] = useState([])

  // useEffect(() => {
  //   fetchCategoryData();
  // }, [data]);

  // const fetchCategoryData = async () => {
  //   const token = get_token();
  //   const formData = {
  //     course_type: data.id,
  //     page: 1,
  //     sub_cat: 1,
  //     main_cat: 0,
  //     // 'course_ids': id
  //   };
  //   const response_getCourse_service = await getCourse_service(
  //     encrypt(JSON.stringify(formData), token)
  //   );
  //   const response_getCourse_data = decrypt(
  //     response_getCourse_service.data,
  //     token
  //   );
  //   console.log("response_getCourse_data", response_getCourse_data);
  //   if (response_getCourse_data.status) {
  //     setGetCourses(response_getCourse_data.data);
  //     // console.log("detail", response_getCourse_data.data);
  //   }
  // };
  return (
    <>
      <p className="tab_text" dangerouslySetInnerHTML={{ __html: data.description }}>
      </p>
      <div className="row">
        {getCourses?.length > 0 ? getCourses?.map((item, index) => {
            return <Card1 keyValue={keyValue} value = {item} titleName = {data.name} handleDetail = {handleDetail} key={index}  />
        })
        :
          <>
            {showError ? 
              <ErrorPageAfterLogin />
              :
              <div className="loader_our_course">
                <LoaderAfterLogin />
              </div>
            }
          </>
        }
      </div>
    </>
  );
};

export default SubTabsData;
