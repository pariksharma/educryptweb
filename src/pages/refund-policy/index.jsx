import React, { useEffect, useState } from 'react'
import Header from '@/component/header/header'
import Footer from '@/component/footer/footer'
import { refundService } from '@/services'
import { get_token } from '@/utils/helpers'
import Head from 'next/head';

const index = () => {

  const [refundData, setRefundData] = useState('');
  const token = get_token()

  useEffect(() => {
    fetchRefundService()
  })

  const fetchRefundService = async () => {
    try {
      const formData = {}
      const response_refund_Service = await refundService()
      if (response_refund_Service.status) {
        setRefundData(response_refund_Service.data)
      }
      // console.log('response_refund_Service', response_refund_Service)
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }
  return (
    <>
      <Head>
        <title>{'Refund/Cancellation Policy'}</title>
        <meta name={'Refund/Cancellation Policy'} content={'Refund/Cancellation Policy'} />
      </Head>
      <Header />
      <div className="container-fluid refund_policy">
        <div
          className=""
          dangerouslySetInnerHTML={{ __html: refundData && refundData }}
        ></div>
      </div>
      <Footer />
    </>
  )
}

export default index