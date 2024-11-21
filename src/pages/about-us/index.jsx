import React, { useEffect, useState } from 'react'
import Footer from '@/component/footer/footer'
import Header from '@/component/header/header'
import { aboutUsService } from '@/services'
import { decrypt, encrypt, get_token } from '@/utils/helpers'
import Head from 'next/head';

const index = () => {

  const [aboutUsData, setAboutUsData] = useState('');
  const token = get_token()

  useEffect(() => {
    fetchAboutService()
  }, [])

  const fetchAboutService = async () => {
    try {
      // console.log('hjghhgjh')
      const formData = {}
      const response_aboutUs_service = await aboutUsService();
      if (response_aboutUs_service.status) {
        setAboutUsData(response_aboutUs_service.data)
      }
      // console.log('response_aboutUs_data', response_aboutUs_service)
      // const response_aboutUs_data = decrypt(response_aboutUs_service.data, token);
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  return (
    <>
      <Head>
        <title>{'About us'}</title>
        <meta name={'About us'} content={'About us'} />
      </Head>
      <Header search={"disable"} />
      <div className="container-fluid detailTopContainer mb-5">
        <div className={`row`}>
          <div className={`col-sm-12 col-md-7 col-lg-6`}>
            <div className="d-flex align-items-center careertextContent">
              <div>
                <h3 className="m-0 bannerTitle mb-4">
                  About us
                </h3>
                {/* <p className="careerBannerText">
                  Have questions? Here you’ll find the answers most valued by our partners, along with access to step-by-step
                  instructions & support.
                </p> */}
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-5 d-flex justify-content-end">
            <img
              className="careerBannerImg d-none d-md-none d-lg-block mt-3 mb-3"
              src="/assets/images/faqImage.svg"
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="container-fluid careerMainSection mb-5">
        <div className="row mt-5">
          <p
            dangerouslySetInnerHTML={{ __html: aboutUsData }}
          ></p>
        </div>
        </div>
      <Footer />
      {/* <Header />
      <div className='container-fluid p-0 mt-5' >
        <div className='' dangerouslySetInnerHTML={{ __html: aboutUsData && aboutUsData }}>
        </div>
      </div>
      <Footer /> */}
    </>

  )
}

export default index