import React, { useEffect, useState, Suspense, lazy } from "react";
import { getCurrentAffair_service } from "@/services";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
// import CurrentAffCard from "../cards/currentAffCard";
import BlogCard from "../cards/blogCard";
import BlogDetail from "../blogs/blogDetail";
// import CurrentAffairDetail from "./currentAffairDetail";
import ErrorPage from "../errorPage";
import LoaderAfterLogin from "../loaderAfterLogin";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import { useRouter } from "next/router";
import Head from 'next/head';

const CurrentAffCard = lazy(() => import("../cards/currentAffCard"));
const CurrentAffairDetail = lazy(() => import("./currentAffairDetail"));

const CurrentAffairList = ({title}) => {
  const [currentAffList, setCurrentAffList] = useState([]);
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showCardError, setShowCardError] = useState(false);
  const [currentAffId, setCurrentAffId] = useState("");
  const [key, setKey] = useState("");
  const router = useRouter();

  useEffect(() => {
    setShowError(false);
    setShowCardError(false);
    fetchCurrentAffair();
  }, []);

  useEffect(() => {
    setKey(currentAffList[0]?.category);
  }, [currentAffList]);

  const fetchCurrentAffair = async () => {
    try {
      const token = get_token();
      const formData = {};
      const response_getCurrentAffairs_service = await getCurrentAffair_service(
        encrypt(JSON.stringify(formData), token)
      );
      const response_getCurrentAffairs_data = decrypt(
        response_getCurrentAffairs_service.data,
        token
      );
      // console.log(
      //   "response_getCurrentAffairs_data",
      //   response_getCurrentAffairs_data
      // );
      if (response_getCurrentAffairs_data?.status) {
        if (response_getCurrentAffairs_data?.data?.length == 0) {
          setShowError(true);
        } else setCurrentAffList(response_getCurrentAffairs_data.data);
      } else {
        if (response_getCurrentAffairs_data == msg) {
          localStorage.removeItem("jwt");
          localStorage.removeItem("user_id");
          router.push("/");
          setCurrentAffList([]);
          setShowError(true);
        } else {
          setCurrentAffList([]);
          setShowError(true);
        }
      }
    } catch (error) {
      console.log("error found: ", error);
      router.push("/");
    }
  };

  const handleBlogDetail = (id) => {
    // console.log('id', id);
    setCurrentAffId(id);
    setIsShowDetail(true);
  };
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name={title} content={title} />
      </Head>
      
      {!isShowDetail ? (
        <section>
          {currentAffList?.length > 0 ? (
            <Tabs
              activeKey={key}
              onSelect={(k) => setKey(k)}
              id="uncontrolled-tab-example"
              className="CustomTab mb-3"
            >
              {currentAffList.map((item, index) => {
                return (
                  <Tab
                    eventKey={item.category}
                    title={item.category}
                    key={index}
                    className="CustomTab m-0 cTabnew"
                    style={{ overflow: "inherit;" }}
                  >
                    <div className="m-0 w-100" key={index}>
                      <div className="row mt-2">
                        {item.data?.length > 0 ? (
                          <Suspense fallback={<LoaderAfterLogin />}>
                            {item.data.map((blogAry, index) => {
                              return (
                                <CurrentAffCard
                                  value={blogAry}
                                  handleBlogDetail={handleBlogDetail}
                                  key={index}
                                />
                              );
                            })}
                          </Suspense>
                        ) : (
                          <ErrorPageAfterLogin />
                        )}
                      </div>
                    </div>
                  </Tab>
                );
              })}
            </Tabs>
          ) : showError ? (
            <ErrorPageAfterLogin />
          ) : (
            <LoaderAfterLogin />
          )}
        </section>
      ) : (
        <section>
          <Suspense fallback={<LoaderAfterLogin />}>
            <CurrentAffairDetail
              id={currentAffId}
              handleShow={() => setIsShowDetail(false)}
            />
          </Suspense>
        </section>
      )}
    </>
  );
};

const msg =
  "You are already logged in with some other devices, So you are logged out from this device. 9";

export default CurrentAffairList;
