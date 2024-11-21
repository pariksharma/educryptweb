import React, { useState } from "react";
import { ImQuotesRight } from "react-icons/im";

const SliderTestimonial = ({ value }) => {
  const [readMore, setReadMore] = useState(false);
  // const description = value.substring(0, 100)
  // console.log('test', value)

  return (
    <div className="card p-2 border-0 shadow test-Radius">
      <div className="gap-1 d-flex align-items-center justify-content-start">
        {/* <i className="cardQuotes fas fa-quote-right"></i> */}
        {/* <ImQuotesRight className='cardQuotes'/> */}
        <img className="cardQuotes" src="/assets/images/quote.svg" alt="" />
        <div>
          {value.file && <img className="testImg" src={value.file} alt="" />}
        </div>
        <div className="">
          <h4 className="testTitle">{value.title}</h4>
          <div className="m-0 test-text">{"Selected As IBPS SO 2021"}</div>
        </div>
      </div>
      <div className="m-0 p-text">
        {/* {value.desc} */}
        
          <span style={{ display: "flex" }}>
        
            <div dangerouslySetInnerHTML={{__html: value?.description}}>
              {/* <a style={{ color: "#FF7426" }} onClick={() => setReadMore(true)}>
                {" "}
                ...read more
              </a> */}
            </div>
          </span>
       
      </div>
    </div>
  );
};

export default SliderTestimonial;
