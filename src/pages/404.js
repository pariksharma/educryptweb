import React from 'react'
import Footer from '@/component/footer/footer'
import Header from '@/component/header/header'
// import {errorImg} from '/assets/images/404Img.svg'

const index = () => {
  return (
    <>
        <Header />
        <div className='container-fluid mt-5'>
          <div className='row my-5'>
            <div className="col-md-12 mt-5">
              <div className="detailErrorImg d-flex justify-content-center align-items-center">
                <img src="/assets/images/404Img.svg" alt="" />
              </div>
              <h4 className="mt-2 m-0 text-center NoDataTitle">No Data found!</h4></div>
              <p className='text-center'>Unable to locate data, seeking alternative methods for retrieval.</p>
            </div>
        </div>
        <Footer />
    </>
  )
}

export default index