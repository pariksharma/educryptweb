import Footer from '@/component/footer/footer'
import Header from '@/component/header/header'
import { faqService } from '@/services';
import { decrypt, get_token } from '@/utils/helpers';
import React, { useEffect, useState } from 'react'
import Head from 'next/head';

const index = () => {

  const [faqData, setFaqData] = useState('');
  const [active, setActive] = useState(0);
  const token = get_token();

  useEffect(() => {
    fetchFaqService()
  }, [])

  const fetchFaqService = async () => {
    try {
      const formData = {}
      const response_faq_service = await faqService();
      const response_faq_data = decrypt(response_faq_service?.data, token)
      // console.log('response_faq_service', response_faq_data)
      if (response_faq_service?.status) {
        setFaqData(response_faq_data?.data);
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }
  return (
    <>
      <Head>
        <title>{'FAQs'}</title>
        <meta name={'FAQs'} content={'FAQs'} />
      </Head>
      <Header search={"disable"} />
      <div className="container-fluid detailTopContainer mb-5">
        <div className={`row`}>
          <div className={`col-sm-12 col-md-7 col-lg-6`}>
            <div className="d-flex align-items-center careertextContent">
              <div>
                <h3 className="m-0 bannerTitle mb-4">
                  FAQs
                </h3>
                <p className="careerBannerText">
                  Have questions? Here you’ll find the answers most valued by our partners, along with access to step-by-step
                  instructions & support.
                </p>
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
        {faqData?.length > 0 && (
          <div className="text-center whycont_width col-md-12 mx-auto mb-3">
            <h4 className="m-0 mb-3 whyTtile">Frequently Asked Questions</h4>
              <div className="p-0 mt-4">
                <div className="accordion accordion-flush" id="faqlist" style={{ textAlign: 'start' }}>
                  {faqData?.map((item, index) => {
                    return <div className="accordion-item" key={index}>
                      <h2
                        className="accordion-header"
                        onClick={() => index != active ? setActive(index) : setActive(-1)}
                      >
                        <button
                          className={`accordion-button ${active !== index && "collapsed"
                            }`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#faq-content-0"
                        >
                          {item.question}
                        </button>
                      </h2>
                      <div
                        id="faq-content-0"
                        className={`accordion-collapse collapse accrdbtn ${active == index && "show"
                          }`}
                        data-bs-parent="#faqlist"
                      >
                        <div className="accordion-body">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default index