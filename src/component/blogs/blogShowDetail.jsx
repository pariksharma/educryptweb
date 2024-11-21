import React, { useEffect, useState } from "react";
import Button1 from "../buttons/button1/button1";
import { FaShare } from "react-icons/fa";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const BlogShowDetail = ({ value }) => {
  const [date, setDate] = useState("");

  const router = useRouter();
  const path = router.query?.tab;
  const versionData = useSelector((state) => state.allCategory?.versionData);

  useEffect(() => {
    const cr_date = new Date(value.created_at * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      setDate(format(cr_date, "EEE d MMMM, yyyy | h:mm a"));
    }
  }, [value]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <h4 className="m-0 DetailTitle">{value.title}</h4>
        </div>
        <div className="col-md-12 mb-2 flex-wrap flex-sm-nowrap d-flex align-items-center justify-content-between">
          <p className="m-0 mb-2 detailblog_Date">{date}</p>
          <div className="gap-2 d-flex align-items-center">
            {/* {versionData?.share_content == 1 &&
              <button className="btn_detailShare">
                <FaShare />
              </button>
            } */}
            <div className="m-0 ">
              {value.file_url && <Button1 value={"View PDF"} />}
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <img
            className="mb-3 m-0 detailImg"
            src={path == "Current affairs" ? value.image : value.image_url}
            alt=""
          />
          <div className="blog_detail">
            <p
              className="m-0"
              dangerouslySetInnerHTML={{ __html: value.description }}
            ></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogShowDetail;
