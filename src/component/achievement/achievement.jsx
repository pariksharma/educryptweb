import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import { get_token, ProdscreenWidth } from "../../utils/helpers";
import { useSelector } from "react-redux";
import { isValidData, encrypt, decrypt } from "../../utils/helpers";


const Achievement = () => {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(true)
    },1000)
  })
    if(isLoading) {
      return (
        <div className="container-fluid p-0 my-4">
          <div className="row">
            <div className="p-0 col-md-6 d-flex align-items-center">
              <div className="d-none d-md-none d-lg-block">
                <img
                  style={{ width: "85%" }}
                  className=""
                  src="/assets/images/our_achie.svg"
                  alt=""
                />
              </div>
            </div>
            <div className="col-md-12 col-lg-6 p-lg-auto d-flex align-items-center justify-content-center">
              <div className="achieve-width text-center text-md-center text-lg-start">
                <h1 className="main-title">Our Achievements</h1>
                <p className="m-0 achieve-text">
                  We are proud of the success we’ve achieved through innovative courses and student accomplishments. Each milestone reflects our dedication to providing top-quality education and fostering growth.
                </p>
                <div className="card_group mt-4">
                  <div className="m-0 text-center card instruct-card">
                    <img
                      src="/assets/images/instructor.svg"
                      alt=""
                      className=""
                    />
                    <div className="card-content">
                      <p className="m-0 inst-count">300</p>
                      <h4 className="c_title">Instructor's</h4>
                    </div>
                  </div>
                  <div className="m-0 text-center card video-card">
                    <img src="/assets/images/Videos.svg" alt="" className="" />
                    <div className="card-content">
                      <p className="m-0 video-count">10,000+</p>
                      <h4 className="c_title">Video's</h4>
                    </div>
                  </div>
                  <div className="m-0 text-center card users-card">
                    <img src="/assets/images/user.svg" alt="" className="" />
                    <div className="card-content">
                      <p className="m-0 user-count">2k+</p>
                      <h4 className="c_title">User's</h4>
                    </div>
                  </div>
                  <div className="m-0 text-center card students-card">
                    <img src="/assets/images/student.svg" alt="" className="" />
                    <div className="card-content">
                      <p className="m-0 student-count">2000+</p>
                      <h4 className="c_title">Student's</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
}
 

export default Achievement;
