import { getBlogListService, getCurrentAffair_service } from "@/services";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import React, { useEffect, useState } from "react";
import BlogCard from "../cards/blogCard";
// import toast, { Toaster } from "react-hot-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/router";
import BlogDetail from "./blogDetail";
import ErrorPage from "../errorPage";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import LoaderAfterLogin from "../loaderAfterLogin";
import Head from 'next/head';

const Blogs = ({title}) => {
  const [blogList, setBlogList] = useState([]);
  const [isShowBlogDetail, setIsShowBlogDetail] = useState(false);
  const [showError, setShowError] = useState(false);
  const [blogId, setBlogId] = useState("");
  const token = get_token();
  const router = useRouter();

  useEffect(() => {
    setShowError(false)
    fetchGetBlogList();
  }, []);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const fetchGetBlogList = async () => {
    try {
      const formData = {};
      const response_getBlogList_service = await getBlogListService(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getBlogList_data = decrypt(
        response_getBlogList_service?.data,
        token
      );
      // console.log('response_getBlogList_data', response_getBlogList_data)
      if (response_getBlogList_data?.status) {
        if (response_getBlogList_data?.data?.length == 0) {
          setShowError(true)
        }
        else setBlogList(response_getBlogList_data.data);
      } else {
        if (response_getBlogList_data.message == msg) {
          toast.error(response_getBlogList_data.message);
          setTimeout(() => {
            localStorage.removeItem("jwt");
            localStorage.removeItem("user_id");
            if (router.pathname.startsWith("/private")) {
              router.push("/");
              setShowError(false)
            } else {
              location.reload();
              setShowError(false)
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.log("error found: ", error)
    }
  };

  const handleBlogDetail = (id) => {
    setIsShowBlogDetail(true);
    setBlogId(id);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name={title} content={title} />
      </Head>

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

      {/* <Toaster position="top-right" reverseOrder={false} /> */}
      <div className="container-fluid">
        <div className="row mt-2">
          {!isShowBlogDetail ? (
            blogList?.length > 0 ?
              blogList.map((item, index) => {
                return (
                  <div className="d-flex justify-content-center col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4 mb-4 p-0" key={index}>
                    <div className="m-0 w-100" key={index}>
                      <BlogCard
                        value={item}
                        handleBlogDetail={handleBlogDetail}
                      />
                    </div>
                  </div>
                );
              })
              :
              <>
                {showError ?
                  <ErrorPageAfterLogin />
                  :
                  <LoaderAfterLogin />
                }
              </>
          ) : (
            <>
              <BlogDetail
                id={blogId}
                handleShow={() => setIsShowBlogDetail(false)}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default Blogs;
