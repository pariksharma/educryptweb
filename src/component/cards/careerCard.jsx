import React from 'react'

const CareerCard = () => {
  return (
    <div className="card whycareerCard p-3 mb-3">
      <div className="d-flex justify-content-center align-items-center whyImg">
        <img src="/assets/images/careerCameraImg.svg" alt="" />
      </div>
      <div className="card-body text-center">
        <h4 className="careerCardtitle">'Glide Away' Retreats</h4>
        <p className="careerCardtext">
          Getting together energizes us, so we gather to co-work quaterly.
        </p>
      </div>
    </div>
  )
}

export default CareerCard