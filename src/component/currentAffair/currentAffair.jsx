import React, { useEffect, useState } from "react";
import { blogAry } from "../../../public/assets/sampleArry";
import Button1 from "../buttons/button1/button1";
import { useSelector } from "react-redux";
import LoginModal from "../modal/loginModal";
import { useRouter } from "next/router";
import { userLoggedIn } from "@/utils/helpers";

const CurrentAffair = () => {
  const [modalShow, setModalShow] = useState(false);

  const currentAffairData = useSelector(
    (state) => state.allCategory?.allCurrentAffair[0]?.data
  );
  const router = useRouter();

  const handleAllCA = () => {
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      router.push("/private/myProfile/17");
    } else {
      setModalShow(true);
    }
  };

  const handleCADetail = (id) => {
    router.push(`/currentAffair/${id}`);
  };

  return (
    <>
      <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
      {/* {isLoading &&  */}
      {currentAffairData?.length && (
        <div className="container my-5">
          <div className="row">
            <div className="col-12 d-flex align-items-center justify-content-center">
              <h1 className="m-0 mb-3 main-title">Current Affairs</h1>
            </div>
          </div>
          <div className="row blogSection">
            {currentAffairData &&
              currentAffairData.map((item, index) => {
                if (index < 3) {
                  return (
                    <div className="col-12 col-sm-6 col-md-4 mb-3" key={index}>
                      <div className="card">
                        {item.image && (
                          <img
                            loading="lazy"
                            className="blogImg"
                            src={item.image}
                            alt=""
                          />
                        )}
                        <div className="m-0 bg_dark pt-3 ">
                          <p className="mb-2 blogDate"></p>
                          <h4 className="blogTitle">{item.title}</h4>
                          <div
                            className="m-0 blog-text"
                            dangerouslySetInnerHTML={{
                              __html: item.description.slice(0, 150),
                            }}
                          ></div>
                          <a
                            role="button"
                            className="text-decoration-none p-0 pt-2 btn readBtn"
                            onClick={() => handleAllCA()}
                          >
                            Read more <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
          </div>
          <div className="row">
            <div className="col-12 mt-4 d-flex justify-content-center blogBtn">
              <Button1
                value="View All Current Affair"
                handleClick={handleAllCA}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrentAffair;
