import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { subject_Ary } from "../../../../public/assets/sampleArry";
import { topic_Ary } from "../../../../public/assets/sampleArry";
import { video_Ary } from "../../../../public/assets/sampleArry";
import Button1 from "../../../component/buttons/button1/button1";
import { FaPlayCircle } from "react-icons/fa";
import { IoLockClosed } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import Button2 from "@/component/buttons/button2/button2";

const CourseCurriculum = ({ propsValue, tabName, resetRef, courseDetail }) => {
  const [layer1Data, setLayer1Data] = useState();
  const [showLayer, setShowLayer] = useState("layer1");
  const [layer2List, setLayer2List] = useState();
  const [layer1Index, setLayer1Index] = useState();
  const [layer2Index, setLayer2Index] = useState();
  const [layer3Data, setLayer3Data] = useState();
  const [id, setId] = useState();

  // console.log("courseDetail", courseDetail)

  useEffect(() => {
    if (propsValue) {
      setLayer1Data(propsValue);
      // console.log("courseData", courseDetail.filter((item) => item.tile_name == "Pdf")[0])
      // setLayer1Data(courseDetail.filter((item) => item.tile_name == "Pdf")[0])
      // setShowLayer()
    }
  }, [propsValue]);

  useEffect(() => {
    setShowLayer("layer1");
    return () => setShowLayer("layer1");
  }, []);

  // useEffect(() => {
  //   if (typeof searchParam !== "undefined") {
  //     setId(searchParam.get("course_id"));
  //   }
  // }, [searchParam]);

  const getLayer2Data = (index) => {
    setLayer1Index(index);
    setShowLayer("layer2");
    // setLayer2List(layer1Data.meta?.list[index]);
    // console.log(layer1Data.meta?.list[index]);
  };

  const getLayer3Data = async (index) => {
    setShowLayer("layer3");
    // setLayer2Index(index);
    // console.log(layer1Data, "layer1Data");
    // console.log(layer2List, "layer 2 Data");
    // const data = {
    //   tile_id: layer1Data.id,
    //   type: layer1Data.type,
    //   revert_api: layer1Data.revert_api,
    //   topic_id: layer2List.list[index].id,
    //   subject_id: layer2List.id,
    //   layer: 3,
    //   page: 1,
    // };
    // const result = await getDetail(data);   /// Api Call
    // const result = "";
    // console.log(result);
    // setLayer3Data(result);
  };

  const getDetail = async (data) => {
    try {
      const formData = new FormData();
      formData.append("course_id", id);
      formData.append("tile_id", data.tile_id);
      formData.append("type", data.type);
      formData.append("revert_api", data.revert_api);
      formData.append("topic_id", data.topic_id);
      formData.append("subject_id", data.subject_id);
      formData.append("layer", data.layer);
      formData.append("page", data.page);
      return await getMasterDataService(formData)
        .then((res) => {
          let { data, status, message } = resHandler(res);
          if (status) {
            // console.log(data, "data");
            return data;
            // setAboutData(data);
          }
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.log("error found: ", error);
      // router.push('/')
    }
  };

  const handleWatch = () => {
    // console.log("watch Now");
  };

  // console.log('val2222', value)

  return (
    <div className="container p-4 pt-0">
      <section className="p-3 page-section-6">
        <div className=" custom-breadcrumb">
          <span
            ref={resetRef}
            className={showLayer == "layer1" ? "breadcrumb" : "breadcrumb"}
            onClick={() => {
              setShowLayer("layer1");
            }}
          >
            {showLayer == "layer1" ||
            showLayer == "layer2" ||
            showLayer == "layer3"
              ? // ? ` > ${layer2List.title}`
                `Subjects >`
              : ""}
          </span>
          <span
            className={
              showLayer == "layer2" ? "active-breadcrumb" : "breadcrumb"
            }
            onClick={() => {
              setShowLayer("layer2");
            }}
          >
            {/* {(layer2List != undefined && showLayer == "layer2") || */}
            {showLayer == "layer2" || showLayer == "layer3"
              ? // ? ` > ${layer2List.title}`
                `Topics >`
              : ""}
          </span>
          <span
            className={
              showLayer == "layer3" ? "active-breadcrumb" : "breadcrumb"
            }
            onClick={() => {
              setShowLayer("layer3");
            }}
          >
            {showLayer == "layer3"
              ? // ? ` > ${layer2List.list[layer2Index].title}`
                tabName == "Full Length Test"
                ? `Test's`
                : `Video's >`
              : ""}
          </span>
        </div>
        {showLayer == "layer3" ? (
          //   layer3Data ? (
          //     layer3Data.list.map((item, i) => {
          video_Ary ? (
            video_Ary.map((item, i) => {
              return (
                <div
                  className=" pg-tabs-description mt-3"
                  key={i}
                  onClick={() => handleOpenVideo(item)}
                >
                  <div className="tabs-deschovr d-flex align-items-center rounded">
                    <div className="w-100 pg-sb-topic d-flex align-items-center justify-content-between">
                      <div className="d-flex justify-content-between">
                        <span className="videoimage">
                          <FaPlayCircle className="videoIcon" />
                          <img
                            src={item.image ? item.image : video_icon}
                            height={"60px"}
                          />
                          {/* <i className="fa fa-file-text" aria-hidden="true"></i> */}
                        </span>
                        <div className="subjectDetails">
                          <p className="m-0 sub_name">{item.title}</p>
                          {item.role == "video" && (
                            <p className="m-0 sub_topics">
                              {tabName == "Full Length Test"
                                ? `Starts: 15 May 2024 Ends: 31 Dec 2027`
                                : `class 10th`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pg-sb-topic pe-2">
                        <div className="btnsalltbba text-center">
                          {" "}
                          {/* {(isLogin && item.is_locked == "0") || */}
                          {tabName == "Full Length Test" ? (
                            <Button2
                              value="Start Test"
                              handleWatch={handleWatch}
                            />
                          ) : propsValue?.mrp == 0 || propsValue?.mrp != 0 ? (
                            <>
                              <Button1
                                value="Watch Now"
                                handleClick={handleWatch}
                              />
                            </>
                          ) : (
                            <span className="videoimage text-center">
                              <IoLockClosed />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center">
              <NoDataFound />
            </div>
          )
        ) : showLayer == "layer2" ? (
          //   layer2List &&
          //   layer2List.list.map((item, i) => {
          topic_Ary &&
          topic_Ary.map((item, i) => {
            return (
              <div
                className=" pg-tabs-description mt-3"
                onClick={() => getLayer3Data(i)}
              >
                <div className="tabs-deschovr d-flex align-items-center rounded">
                  <div
                    className="pg-sb-topic d-flex align-items-center"
                    style={{ width: "97%" }}
                  >
                    <span className="videoimage">
                      <img
                        src={
                          item.image_icon && item.image_icon.length
                            ? item.image_icon
                            : item.image
                        }
                        height={"60px"}
                      />
                      {/* <img src={item} height={'50px'}/>
            <i className="fa fa-file-text" aria-hidden="true"></i>  */}
                    </span>

                    {/* <h3>{item.title}</h3> */}
                    <div className="subjectDetails">
                      <p className="m-0 sub_name">{item.title}</p>
                      {item.role == "subject" && (
                        <p className="m-0 sub_topics">{item.content} Topics</p>
                      )}
                      {item.role == "topic" && (
                        <p className="m-0 sub_topics">{item.content} video's</p>
                      )}
                    </div>
                  </div>
                  <div className="pg-sb-topic pe-2">
                    <span className="videoimage text-center">
                      {/* {item.is_locked == '0' ?   */}
                      {/* <i className="fa fa-angle-right" aria-hidden="true"></i> */}
                      <IoIosArrowForward />
                      {/* :  <img src={lock_icon}/>} */}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          showLayer == "layer1" &&
          layer1Data &&
          layer1Data?.meta?.list?.map((item, i) => {
            // subject_Ary &&
            // subject_Ary.map((item, i) => {
            return (
              <div
                className=" pg-tabs-description mt-3"
                onClick={() => getLayer2Data(i)}
              >
                <div className="tabs-deschovr d-flex align-items-center rounded">
                  <div
                    className="pg-sb-topic d-flex align-items-center"
                    style={{ width: "97%" }}
                  >
                    <span className="videoimage">
                      <img
                        src={
                          item.image_icon && item.image_icon.length
                            ? item.image_icon
                            : item.image
                        }
                        height={"60px"}
                      />
                      {/* <img src={item} height={'50px'}/>
            <i className="fa fa-file-text" aria-hidden="true"></i>  */}
                    </span>

                    {/* <h3>{item.title}</h3> */}
                    <div className="subjectDetails">
                      <p className="m-0 sub_name">{item.title}</p>
                      {item.role == "subject" && (
                        <p className="m-0 sub_topics">{item.content} Topics</p>
                      )}
                      {item.role == "topic" && (
                        <p className="m-0 sub_topics">{item.content} video's</p>
                      )}
                    </div>
                  </div>
                  <div className="pg-sb-topic pe-2">
                    <span className="videoimage text-center">
                      {/* {item.is_locked == '0' ?   */}
                      {/* <i className="fa fa-angle-right" aria-hidden="true"></i> */}
                      <IoIosArrowForward />
                      {/* :  <img src={lock_icon}/>} */}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default CourseCurriculum;
