import React from 'react'
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useRouter } from 'next/router';

const prod_image1 = '/assets/images/product1.png';

const SliderProduct = ({value}) => {

  const router = useRouter();
  // console.log('props', value)

  const handleBuy = () => {
    router.push(`/view-courses/${value?.name + ':' +value.id}`);
  }; 

  if(value) {
    return (
      <div className="mb-3 ourProductSection">
        <div className="card">
            {prod_image1 && <img className="ourProImg" src={value?.web_icon ? value?.web_icon : prod_image1} alt="" />}
            <div className="bottom_shadow"></div>
            <a className="m-0 bg_dark p-2 d-flex align-items-center justify-content-between text-decoration-none"
              onClick={handleBuy}
              style={{cursor: 'pointer'}}
            >
                <h5 className="m-0 ourtitle">{value.name}</h5>
                <Icon.ChevronRight />
            </a>
        </div>
    </div>
    )
  }
  else {
    null
  }
}

export default SliderProduct