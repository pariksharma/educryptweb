import Footer from '@/component/footer/footer'
import Header from '@/component/header/header'
import { termService } from '@/services';
import { get_token } from '@/utils/helpers';
import React, { useEffect, useState } from 'react'
import Head from 'next/head';

const index = () => {

  const [termsData, setTermData] = useState('');
  const token = get_token();

  useEffect(() => {
    fetchTermsService()
  }, [])

  const fetchTermsService = async () => {
    try {
      const formData = {}
      const response_term_service = await termService()
      if (response_term_service.status) {
        setTermData(response_term_service.data);
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  return (
    <>
      <Head>
        <title>{'Terms and Conditions'}</title>
        <meta name={'Terms and Conditions'} content={'Terms and Conditions'} />
      </Head>
      <Header />
      <div className="container-fluid termsCondition">
        <div
          className=""
          dangerouslySetInnerHTML={{ __html: termsData && termsData }}
        ></div>
      </div>
      <Footer />
    </>
  )
}

export default index