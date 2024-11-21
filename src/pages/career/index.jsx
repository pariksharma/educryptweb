import React from "react";
import Header from "@/component/header/header";
import Footer from "@/component/footer/footer";
import CareerCard from "@/component/cards/careerCard";
import Testimonial from "@/component/testimonial/testimonial";

const index = () => {
  return (
    <>
      <Header />
      <div className="container-fluid careerHeadSection mb-5">
        <div className={`row`}>
          <div className={`col-sm-12 col-md-7 col-lg-6`}>
            <div className="d-flex align-items-center careertextContent">
              <div>
                <h3 className="m-0 bannerTitle mb-4">
                  Let’s shape the future of learning together.
                </h3>
                <p className="careerBannerText">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book.
                </p>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-5 d-flex justify-content-end">
            <img
              className="careerBannerImg d-none d-md-none d-lg-block mt-3 mb-3"
              src="/assets/images/careerBanner.svg"
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="container-fluid careerMainSection mb-5">
        <div className="row mt-5">
          <div className="text-center whycont_width col-md-12 mx-auto">
            <h4 className="m-0 mb-3 whyTtile">Why EduCrypt ?</h4>
            <p className="m-0 whyText">
              EduCrypt leads the EdTech field with cutting-edge tools, serving
              over 20 million learners. We believe in collective growth, where
              collaboration and inspiration drive the best results. At EduCrypt,
              we’re a dynamic community that works, learns, and celebrates
              together. We seek passionate, innovative individuals ready to
              transform education and make a real impact. If you're excited
              about shaping the future of learning with a collaborative team,
              EduCrypt is the place for you.
            </p>
          </div>
        </div>
        <div className="row mt-5 mx-auto w_contentWidth">
          <div className="col-md-4">
            <CareerCard />
          </div>
          <div className="col-md-4">
            <CareerCard />
          </div>
          <div className="col-md-4">
            <CareerCard />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 mt-5 mb-4 text-center">
            <h4 className="m-0 mb-2 worktitle">
              A Workspace That's Perfect For You
            </h4>
            <p className="m-0 work_text">
              A work environment that fosters both career and personal
              development{" "}
            </p>
          </div>

          <div className="col-md-12 widthWorkplace mx-auto">
            <div className="workplaceCont">
              <img src="/assets/images/blog1.png" />
              <img src="/assets/images/blog1.png" />
              <img src="/assets/images/blog1.png" />
              <img src="/assets/images/blog1.png" />
            </div>
          </div>
        </div>
        <Testimonial />
      </div>
      <Footer />
    </>
  );
};

export default index;
