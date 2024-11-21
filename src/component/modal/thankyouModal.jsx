import React from 'react'
import { Modal } from 'react-bootstrap'

const ThankyouModal = (props) => {

  return (
    <>
        <Modal
        {...props}
        size={"sm"}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <div className="modal-body thankModal text-center" style={{padding: "30px"}}  >
          <div className="d-flex justify-content-center">
            <img className="successImg" src="/assets/images/Success.svg"
              alt=""
            />
          </div>
          <h4 className="m-0">Thank You!</h4>
          <p className="m-0">Your payment is successful!</p>
        </div>
      </Modal>
    </>
  )
}

export default ThankyouModal