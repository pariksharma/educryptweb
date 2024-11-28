import React from "react";

const bottom_banner = ({scrollToFooter}) => {
  return (
    <>
        <div className="container bottom_banner" >
            <img src="/assets/images/bottom_banner.png" onClick={scrollToFooter} style={{ cursor: 'pointer' }} alt="" />
        </div>
    </>
  );
};

export default bottom_banner;
