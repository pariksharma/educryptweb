import React, { useEffect, useState } from "react";
import Button1 from "../buttons/button1/button1";
import { getMasterDataService } from "@/services";
import { IoIosArrowForward } from "react-icons/io";
import { decrypt, encrypt, get_token } from "@/utils/helpers";

const RecordedClass = ({ propsValue, tabName, resetRef, courseDetail, CourseID }) => {
  const [layer1Data, setLayer1Data] = useState();
  const [showLayer, setShowLayer] = useState("layer1");
  const [layer2List, setLayer2List] = useState();
  const [layer1Index, setLayer1Index] = useState();
  const [layer2Index, setLayer2Index] = useState();
  const [layer3Data, setLayer3Data] = useState();
  const [id, setId] = useState();


  useEffect(() => {
    if (courseDetail) {
      setLayer1Data(courseDetail);
    }
  }, [courseDetail]);

  useEffect(() => {
    setShowLayer("layer1");
    return () => setShowLayer("layer1");
  }, []);

  const getLayer2Data = (index) => {
    setLayer1Index(index);
    setShowLayer("layer2");
    setLayer2List(layer1Data.meta?.list[index]);
    // console.log(layer1Data.meta?.list[index]);
  };

  const getLayer3Data = async (index) => {
    setShowLayer("layer3");
    setLayer2Index(index);
    // console.log(layer1Data, "layer1Data");
    // console.log(layer2List, "layer 2 Data");
    const data = {
      tile_id: layer1Data.id,
      type: layer1Data.type,
      revert_api: layer1Data.revert_api,
      topic_id: layer2List.list[index].id,
      subject_id: layer2List.id,
      layer: 3,
      page: 1,
    };
    const result = await getDetail(data);   /// Api Call
    // const result = "";
    // console.log('result', result);
    setLayer3Data(result);
  };

  const getDetail = async (data) => {
    const token = get_token();
    const formData = {
      course_id: CourseID,
      tile_id: data.tile_id,
      type: data.type,
      revert_api: data.revert_api,
      topic_id: data.topic_id,
      subject_id: data.subject_id,
      layer: data.layer,
      page: data.page,
    }
    const response_getMasterData_service = await getMasterDataService(encrypt(JSON.stringify(formData), token))
    const response_getMasterData_Data = decrypt(response_getMasterData_service.data, token);
    // console.log('response_getMasterData_Data', response_getMasterData_Data.data)
    if(response_getMasterData_Data.status) {
      return response_getMasterData_Data.data
    }
  };

  const handleRead = () => {
    // console.log("Read Now");
  };

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
                `PDF's >`
              : ""}
          </span>
        </div>
        {showLayer == "layer3" ? (
            layer3Data ? (
              layer3Data.list.map((item, i) => {
          // PDF_Ary ? (
          //   PDF_Ary.map((item, i) => {
              return (
                <div
                  className=" pg-tabs-description mt-3"
                  key={i}
                //   onClick={() => handleOpenVideo(item)}
                >
                  <div className="tabs-deschovr d-flex align-items-center rounded">
                    <div className="w-100 pg-sb-topic d-flex align-items-center justify-content-between">
                      <div className="d-flex justify-content-between">
                        <img
                          src={item.image ? item.image : ""}
                          height={"60px"}
                        />
                        {/* <i className="fa fa-file-text" aria-hidden="true"></i> */}
                        <div className="subjectDetails">
                          <p className="m-0 sub_name">{item.title}</p>
                          {item.role == "PDF" && (
                            <p className="m-0 sub_topics">
                              {item.release_date}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pg-sb-topic pe-2">
                        <div className="btnsalltbba text-center d-flex">
                          {" "}
                          {/* {(isLogin && item.is_locked == "0") || */}
                          {layer1Data.type == "pdf" ?
                            <Button1 value="Read" handleClick={handleRead} />
                            :
                            <Button1 value="Watch Now" handleClick={handleRead} />
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center">{/* <NoDataFound /> */}</div>
          )
        ) : showLayer == "layer2" ? (
            layer2List &&
            layer2List.list.map((item, i) => {
          // topic_PDF_Ary &&
          // topic_PDF_Ary.map((item, i) => {
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
                      {/* <img src={item} height={'50px'}/> */}
                      {/* <i className="fa fa-file-text" aria-hidden="true"></i> */}
                    </span>

                    {/* <h3>{item.title}</h3> */}
                    <div className="subjectDetails">
                      <p className="m-0 sub_name">{item.title}</p>
                      {item.role == "subject" && (
                        <p className="m-0 sub_topics">{item.content} Topics</p>
                      )}
                      {item.role == "topic" && (
                        <p className="m-0 sub_topics">{item.content} PDF's</p>
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
          // subject_PDF_Ary &&
          // subject_PDF_Ary.map((item, i) => {
            return (
              <div
                className=" pg-tabs-description mt-3"
                onClick={() => getLayer2Data(i)}
                key={i}
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
                      {/* <img src={item} height={'50px'}/> */}
                      {/* <i className="fa fa-file-text" aria-hidden="true"></i> */}
                    </span>

                    {/* <h3>{item.title}</h3> */}
                    <div className="subjectDetails">
                      <p className="m-0 sub_name">{item.title}</p>
                      {item.role == "subject" && (
                        <p className="m-0 sub_topics">{item.content} Topics</p>
                      )}
                      {item.role == "topic" && (
                        <p className="m-0 sub_topics">{item.content} PDF's</p>
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

export default RecordedClass;