import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Button2 from "../buttons/button2/button2";

const CouponModal = (props) => {
  // console.log('prefill', props.value)

  const [couponList, setCouponList] = useState([]);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    setCouponList(props.value);
  }, [props.value]);

  useEffect(() => {
    setCouponCode("");
  }, [props.show]);

  return (
    <Modal
      {...props}
      size={"sm"}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="couponModal"
    >
      <Modal.Header closeButton>
        <p className="m-0">Apply Coupon</p>
      </Modal.Header>
      <div className="modal-body py-2">
        <div className="gap-2 d-flex align-items-center">
          <input
            className="coupon_field"
            type=""
            placeholder="Enter Coupon Here"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <Button2
            value={"Apply"}
            handleClick={() => props.handleCouponApply(couponCode)}
          />
        </div>
      </div>
      <div className="coupon_divider"></div>
      <div className="modal-body py-2">
        <div className="mt-2 coupon_content">
          <ul className="mt-2 list-unstyled coupon_List">
            {/* {console.log('couponList', couponList)} */}
            {couponList &&
              couponList.map((item, index) => {
                return (
                  <li className="mb-2 card coupon_listCard" key={index}>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="m-0 couponCodeTitle">
                        <img
                          className="me-1"
                          style={{ width: "14px" }}
                          src="/assets/images/couponLogo.png"
                        />
                        {item?.coupon?.coupon_tilte}
                        <img
                          className="ms-1 copyImg"
                          src="/assets/images/copyImg.svg"
                          alt=""
                        />
                      </p>
                      <p
                        className="m-0 applyBtn"
                        onClick={() =>
                          props.handleCouponApply(item?.coupon?.coupon_tilte)
                        }
                      >
                        APPLY COUPON
                      </p>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default CouponModal;
