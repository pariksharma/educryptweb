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
import BlogShowDetail from "../blogs/blogShowDetail";
import { useRouter } from "next/router";
import ErrorPageAfterLogin from "../errorPageAfterLogin";
import LoaderAfterLogin from "../loaderAfterLogin";

const CurrentAffairDetail = ({ id, handleShow }) => {

    const [key, setKey] = useState('');
    const [currentAffairData, setCurrentAffairData] = useState([]);
    const [showError, setShowError] = useState(false);

    const router = useRouter();
    const token = get_token();

    useEffect(() => {
        fetchCurrentAff()
    }, [])

    useEffect(() => {
      return () => {
        toast.dismiss();
      };
    }, []);

    useEffect(() => {
        if(currentAffairData) {
            setKey(currentAffairData[0]?.category_name)
        }
    }, [currentAffairData])

    const fetchCurrentAff = async () => {
      try{
        const formData = {
          id: id
        }
        const response_currentAffairDetail_service = await getCurrentAffairDetails(encrypt(JSON.stringify(formData), token));
        const response_currentAffairDetail_data = decrypt(response_currentAffairDetail_service.data, token);
        // console.log('response_currentAffairDetail_data', response_currentAffairDetail_data)
        if(response_currentAffairDetail_data.status){
          if(response_currentAffairDetail_data?.data?.length == 0) {
            setShowError(true)
          }
          else setCurrentAffairData(response_currentAffairDetail_data.data) 
        }
      } catch (error) {
        console.log("error found: ", error)
      }
    }
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

      <section>
      <nav aria-label="breadcrumb ">
        <ol className="breadcrumb mb-4 cursor">
          <li className="breadcrumb-item" onClick={handleShow}>
            <Icon.ChevronLeft />
            {`Back`}
          </li>
        </ol>
      </nav>
      </section>
      <section>
        {currentAffairData?.length > 0 ? 
          <Tabs
            activeKey={key}
            onSelect={(k) => setKey(k)}
            id="uncontrolled-tab-example"
            className="CustomTab mb-3"
          >
            <Tab eventKey={currentAffairData[0]?.category_name} title={currentAffairData[0]?.category_name}>
              {currentAffairData.map((item, index) => 
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
      </section>
    </div>
  );
};

export default CurrentAffairDetail;
