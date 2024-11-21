import React from 'react'

const ErrorPageAfterLogin = () => {
  return (
    <div className="w-100 d-flex justify-content-center align-items-center">
      <div className="detailErrorImg ">
        <img loading='lazy' src="/assets/images/detailErrorImg.svg" alt="" />
        <h4 className="mt-2 m-0 NoDataTitle">No Data found!</h4>
      </div>
    </div>
  )
}

export default ErrorPageAfterLogin