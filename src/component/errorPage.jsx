import React from 'react'

const ErrorPage = () => {
  return (
    <div className="row">
      <div className="col-md-12 d-flex justify-content-center align-items-center my-5">
        <div className="w-100 text-center">
          <div className="detailErrorImg d-flex justify-content-center align-items-center">
            <img src="/assets/images/detailErrorImg.svg" alt="" />
          </div>
          <h4 className="mt-2 m-0 text-center NoDataTitle">No Data found!</h4>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage