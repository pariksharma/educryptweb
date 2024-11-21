import React from "react";
import { useRouter } from "next/router";
import { IoStar } from "react-icons/io5";
import Button1 from "../buttons/button1/button1";
import Button2 from "../buttons/button2/button2";

const Card2 = ({ value, titleName }) => {
  const router = useRouter();

  const handleExplore = () => {
    // console.log("Clicked ==========");
    router.push(
      `/view-courses/details/${
        titleName + ":" + value.id + "&" + value.combo_course_ids + "parent:"
      }`
    );
    // navigate('/viewDetail/422')
    // location.reload()
  };

  return (
    <div
      className="card border-0 shadow b-radius mb-3 p-2 freeCard"
      style={{ width: "320px" }}
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
      {/* <div className="m-0 free-badge">FREE</div> */}
      <div className="card-body pt-3 px-0 pb-0">
        <h6 className="mb-2 slideTitle">{value?.title}</h6>
        {/* <div className="m-0 clearfix">
                    <div className="countTitle"><i className="fab fa-youtube"></i> 120 videos</div>
                    <div className="countTitle ms-3"><i className="far fa-file-alt"></i> 40 PDF's</div>
                </div> */}
        <div className="courserate1">
          <div className="d-flex1">
            <div className="courseValidity1">
              <span className="validity1">Validity: </span>
            </div>
            <div className="courseRemaining1">
              <span className="remaining">
                <p>Remaining </p>
              </span>
            </div>
          </div>
          {/* <div className="freeStripe m-0">
                    Free
                </div> */}
        </div>
        {/* <button className="btn exploreBtn">Explore now</button> */}
        <div className="courseBtn d-flex">
          <Button1
            value={value?.is_purchased == 1 ? "View Content" : "View Details"}
            handleClick={handleExplore}
          />
          <Button2 value="Extend Validity" />
        </div>
      </div>
    </div>
  );
};

export default Card2;
