import Footer from '@/component/footer/footer'
import Header from '@/component/header/header'
import { contactUsService } from '@/services';
import { get_token } from '@/utils/helpers';
import React, { useEffect, useState } from 'react'
import Head from 'next/head';

const index = () => {

  const [contactUsData, setContactUsData] = useState('');
  const token = get_token();

  useEffect(() => {
    fetchContactService()
  }, [])

  const fetchContactService = async () => {
    try{
      const formData = {};
      const response_contactUs_service = await contactUsService();
      if(response_contactUs_service.status) {
        setContactUsData(response_contactUs_service.data);
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }
  return (
    <>
     <Head>
        <title>{'Contact us'}</title>
        <meta name={'Contact us'} content={'Contact us'} />
      </Head>
    <Header />
    <div className="container-fluid contactCont">
      <div className="row mb-5 pt-5">
        <div className="col-md-4">
          <img
            className="contact_Img"
            src="/assets/images/contact_Img.svg"
            alt=""
          />
        </div>
        <div className="col-md-4 pt-5">
          {/* <h4 className="mt-5 c_title">Contact us</h4>
          <h5 className="mt-4 v_title">Visit us</h5> */}
          <p className="c_text" 
            dangerouslySetInnerHTML={{ __html: contactUsData }}
          >
          </p>
        </div>
        {/* <div className="col-md-4">
          <h5 className="vv_title">Contact</h5>
          <p className="c_text">
            H 65 Sector 63 Noida Uttar Pradesh India - 201301
          </p>
        </div> */}
      </div>
    </div>
    <Footer />
  </>
  )
}

export default index