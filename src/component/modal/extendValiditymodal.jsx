import React, { useEffect, useState } from 'react'
import { Modal } from "react-bootstrap";
import Button1 from "../buttons/button1/button1";
import Button2 from '../buttons/button2/button2';

const ExtendValiditymodal = (props) => {

  const [isChecked, setIsChecked] = useState(0);
  const [priceList, setPriceList] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);


  useEffect(() => {
    if(props.courseDetail?.prices?.length > 0) {
      setPriceList(props.courseDetail?.prices)
      setIsChecked(props.courseDetail?.prices[0])
    }
  }, [props.courseDetail])

  const handleOptionChange = (val) => {
    setSelectedOption(val.id)
    //  console.log('target',val)
    setIsChecked(val)
  }

  
  // console.log('prices', priceList)
  return (
    <Modal
      {...props}
      size={"md"}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="extendCouponModal"
    >
      <Modal.Header closeButton>
        <h6 className="m-0 extTitle">Extend Course Validity</h6>
      </Modal.Header>
      <div className="mt-2 coupon_content">
        <ul className="mt-2 list-unstyled extendCouponModal px-4">
          {priceList?.length > 0 && priceList.map((item, index) => {
          return <>
          <li
             key={index}
            className={`mb-3 p-3 rounded card extCoupon_listCard ${
              isChecked.id == item.id ? "active" : ""
            }`}
            onClick={() => handleOptionChange(item)} style={{cursor: 'pointer'}}>
            <p className="m-0 d-flex justify-content-between align-items-center">{`${item.price}/- For ${item.validity} days`} 
            <input
              className="extcouponRadio form-check-input"
              type="radio"
              value={0}
              style={{ 
                accentColor: '#FF7426',
                width: '1.5em',
                height: '1.5em'
              }}
              checked={isChecked.id == item.id}
              // onChange={handleOptionChange}
            />
            </p>
          </li>
          {/* <div key={index} className={`mb-3 p-3 rounded ${isChecked.id == item.id ? 'bg-light' : ''}`}>
          <div className="form-check d-flex justify-content-between align-items-center">
            <label className="form-check-label" htmlFor={`option${index}`}>
              ₹{item.price}/- For {item.validity} Days
            </label>
            {console.log(isChecked.id,  item.id)}
            <input
              className="form-check-input"
              type="radio"
              name="validityOption"
              id={`option${index}`}
              value={index}
              checked={isChecked.id == item.id}
              style={{ 
                accentColor: '#FF7426',
                width: '1.5em',
                height: '1.5em'
              }}
            //  onChange={handleOptionChange}
              onChange={handleOptionChange}
            />
          </div>
          </div> */}

      <style jsx>{`
        .coupon_listCard  {box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;border:none}
        .coupon_listCard.active  {
          background: linear-gradient(89.62deg, #FFF5EF 0.33%, #FFEADE 92.16%);
        }
        .form-check-input:checked {
          background-color: #FF7426 !important;
          border-color: #FF7426 !important;
        }
      `}</style>
          </>
          
          })}
        </ul>
        <div className="w-100 text-center my-4 px-4">
          <Button1 
            value = "Continue"
            classCustom=""
            handleClick={() => props.handleSelectedValidity(isChecked, props.courseDetail)} 
          />
        </div>
      </div>
    </Modal>
  )
}

export default ExtendValiditymodal