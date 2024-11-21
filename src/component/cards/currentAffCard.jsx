import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import BlogDetail from "../blogs/blogDetail";

const CurrentAffCard = ({ value, handleBlogDetail }) => {
  const [isShowBlogDetail, setIsShowBlogDetail] = useState(false);
  const [blogId, setBlogId] = useState("");
  const [date, setDate] = useState("");
  const router = useRouter();
  // console.log(value)

  useEffect(() => {
    const cr_date = new Date(value.created_at * 1000);
    if (cr_date) {
      setDate(
        cr_date.toString().substring(0, cr_date.toString().indexOf("GMT"))
      );
    }
  }, [value]);

  // const handleBlogDetail = () => {
  //     setIsShowBlogDetail(true)
  //     setBlogId(value.id)
  // }

  return (
    <>
      {!isShowBlogDetail ? (
        <div className="d-flex justify-content-center col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 mb-4 p-0">
          <div className="card border-0 shadow2 b-radius course_card m-0">
            <img
              src={value.image ? value.image : "/assets/images/noImage.jfif"}
              style={{ borderRadius: "10px" }}
            />
            <div className="card-body pt-2 px-0 pb-0">
              <h4 className="m-0 blogTitle">{value.title}</h4>
              <p className="m-0 blog_Date">{date}</p>
              <a
                role="button"
                className="text-decoration-none read_more p-0 pt-2"
                onClick={() => handleBlogDetail(value.id)}
              >
                Read more <i className="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <BlogDetail
            id={blogId}
            handleShow={() => setIsShowBlogDetail(false)}
          />
        </>
      )}
    </>
  );
};

export default CurrentAffCard;
