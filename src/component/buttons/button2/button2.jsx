import React, { useMemo } from 'react';
import { HiOutlineArrowNarrowRight } from "react-icons/hi";

const Button2 = ({ value, handleClick, data, adClass }) => {
  const cartLogo = '/assets/images/addToCartLogo.png';
  const defaultValue = useMemo(() => "View All Blogs", []);

  return (
    <>
          <button
            className={`m-0 btn userBtn1 text-decoration-none  ${data == 0 ? 'w-100': ''} ${adClass ? 'active' : ''}`} style={{ whiteSpace: "nowrap"  }}
            onClick={handleClick}
          >
            {value == "Add to Cart" && (
          <img className='me-1' src={cartLogo} style={{ width: "15px", height: "15px" }} />
        )}
            {value}
            {value === defaultValue && <HiOutlineArrowNarrowRight />}
          </button>
        </>
  );
}

export default Button2;
