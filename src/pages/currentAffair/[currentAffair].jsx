import React, { useEffect, useState } from 'react';
// import toast, { Toaster } from 'react-hot-toast';
import { ToastContainer, toast } from 'react-toastify';
import * as Icon from "react-bootstrap-icons";
import { useRouter } from 'next/router';
import { getCurrentAffairDetails } from '@/services';
import { decrypt, encrypt, get_token } from '@/utils/helpers';
import { format } from "date-fns";
import { FaShare } from "react-icons/fa";
import Button1 from '@/component/buttons/button1/button1';
import { useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap-icons/font/bootstrap-icons.css";

const CurrentAffair = () => {

    const [key, setKey] = useState('');
    const [currentAffairData, setCurrentAffairData] = useState([])
    const [date, setDate] = useState('')
    const router = useRouter();
    const {currentAffair} = router.query
    const token = get_token()
    const versionData = useSelector((state) => state.allCategory?.versionData);

    // console.log(currentAffair)

    useEffect(() => {
        fetchCurrentAff();
    }, [])

    useEffect(() => {
      return () => {
        toast.dismiss();
      };
    }, []);

    // useEffect(() => {
    //     console.log('currentAffairData',currentAffairData)
    //     const cr_date = new Date(currentAffairData.created_at * 1000);
    //     if (cr_date) {
    //       // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
    //       setDate(format(cr_date, "EEE d MMMM, yyyy | h:mm a"));
    //     }
    //   }, [currentAffairData]);


  const fetchCurrentAff = async () => {
    try{
      const formData = {
        id: currentAffair
      }
      const response_currentAffairDetail_service = await getCurrentAffairDetails(encrypt(JSON.stringify(formData), token));
      const response_currentAffairDetail_data = decrypt(response_currentAffairDetail_service.data, token);
      // console.log('response_currentAffairDetail_data', response_currentAffairDetail_data)
      if(response_currentAffairDetail_data.status){
        setCurrentAffairData(response_currentAffairDetail_data.data) 
        setDate(response_currentAffairDetail_data.data.created_at)
        setKey(response_currentAffairDetail_data.data[0]?.category_name)
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
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
 
      <section className='m-3'>
      <nav aria-label="breadcrumb ">
        <ol className="breadcrumb mb-4 cursor">
          <li className="breadcrumb-item" 
          onClick={() => router.back()}
          >
            {`Home`}
            <Icon.ChevronRight />
          </li>
          <li className="breadcrumb-item active" 
        //   onClick={handleShow}
          >
            
            {`detail`}
            <Icon.ChevronRight />
          </li>
        </ol>
      </nav>
      </section>
      <section>
        {/* <Tabs
          activeKey={key}
          onSelect={(k) => setKey(k)}
          id="uncontrolled-tab-example"
          className="CustomTab mb-3"
        > */}
          {/* <Tab eventKey={currentAffairData[0]?.category_name} title={currentAffairData[0]?.category_name}> */}
            {/* {console.log(currentAffairData)} */}
            {currentAffairData && currentAffairData.map((item, index) => {
            // {console.log(item)}
                return <div className="container-fluid" key={index}>
                <div className="row">
                  <div className="col-md-12">
                    <h4 className="m-0 DetailTitle">{item.title}</h4>
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
                        <Button1 value={"View PDF"} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <img
                      loading='lazy'
                      className="mb-3 m-0 detailImg"
                      src={item.image}
                      alt=""
                    />
                    <div className="blog_detail">
                      <p
                        className="m-0"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      ></p>
                    </div>
                  </div>
                </div>
              </div>
            }
            )}
          {/* </Tab>
        </Tabs> */}
      </section>
    </div>
  )
}

export default CurrentAffair