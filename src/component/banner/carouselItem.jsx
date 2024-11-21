import React from 'react'
import style from './carouselItem.module.css'

const CarouselItem = (props) => {
  return (
      <div className="card-img banner_img">
        {props.value && <img loading='lazy' src={props.value} className="img-fluid" alt="" />}
      </div>
  )
}

export default CarouselItem