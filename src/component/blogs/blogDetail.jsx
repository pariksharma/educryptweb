import React, { useEffect, useState } from "react";
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import { getBlogDetailService, getCurrentAffairDetails } from "@/services";
import BlogShowDetail from "./blogShowDetail";
import { useRouter } from "next/router";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import LoaderAfterLogin from "../loaderAfterLogin";

const BlogDetail = ({ id, handleShow }) => {
  const [key, setKey] = useState("");
  const [blogDetailData, setBlogDetailData] = useState([]);
  const [showError, setShowError] = useState(false)

  const router = useRouter();
  const token = get_token();

  useEffect(() => {
    setShowError(false);
    fetchBlogDetail();
  }, []);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    if(blogDetailData) {
        setKey(blogDetailData[0]?.category_name)
    }
}, [blogDetailData])

  const fetchBlogDetail = async () => {
    try {
      const formData = {};
      const response_blogDetail_service = await getBlogDetailService(
        id,
        encrypt(JSON.stringify(formData), token)
      );
      const response_blogDetail_data = decrypt(
        response_blogDetail_service.data,
        token
      );
      if (response_blogDetail_data.status) {
        if(response_blogDetail_data?.data?.length == 0){
          setShowError(true)
          // console.log("response_blogDetail_data", response_blogDetail_data.data);
        }
        else setBlogDetailData(response_blogDetail_data.data);
      }
    } catch (error) {
      console.log("error found: ", error)
      router.push('/')
    }
  };
  return (
    <div>
      {/* <Toaster position="top-right" reverseOrder={false} /> */}
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
 
      <section className="container-fluid">
        <div className="row">
          <div className="col-md-12 p-0">
            <nav aria-label="breadcrumb ">
              <ol className="breadcrumb mb-4 cursor">
                <li className="breadcrumb-item" onClick={handleShow}>
                  <Icon.ChevronLeft />
                  {`Back`}
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </section>
      <section className="container-fluid">
        <div className="row">
          <div className="col-md-12 p-0">
            {blogDetailData?.length > 0 ?
              <Tabs
                activeKey={key}
                onSelect={(k) => setKey(k)}
                id="uncontrolled-tab-example"
                className="CustomTab mb-3"
              >
                {/* <Tab eventKey="DAILY" title="DAILY">
                  {blogDetailData.map((item, index) =>
                    item.category_name == "Daily Blogs" ? (
                      <BlogShowDetail key={index} value={item} />
                    ) : (
                      <p className="m-0 text-center">No Data Found</p>
                    )
                  )}
                </Tab>
                <Tab eventKey="WEEKLY" title="WEEKLY">
                  {blogDetailData.map((item, index) =>
                    item.category_name == "Weekly Blogs" ? (
                      <BlogShowDetail key={index} value={item} />
                    ) : (
                      <p className="m-0 text-center">No Data Found</p>
                    )
                  )}
                </Tab> */}
                {/* <Tab eventKey="MONTHLY" title="MONTHLY">
                  {blogDetailData.map((item, index) =>
                    item.category_name == "Monthly Blogs" ? (
                      <BlogShowDetail key={index} value={item} />
                    ) : (
                      <p className="m-0 text-center">No Data Found</p>
                    )
                  )}
                </Tab> */}
                <Tab eventKey={blogDetailData[0]?.category_name} title={blogDetailData[0]?.category_name}>
                  {blogDetailData.map((item, index) => 
                    <BlogShowDetail key={index} value = {item} />
                  )}
                </Tab>
              </Tabs>
            :
            showError ?
              <ErrorPageAfterLogin />
              :
              <LoaderAfterLogin />
            }
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;
