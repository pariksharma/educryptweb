import React, { useEffect } from 'react'
import { IoIosArrowForward } from "react-icons/io";

const VideoTab = ({ item, Index, nextIndex, image }) => {
  const handleClick = (index) => {
    // window.scrollTo({ top: 50, behavior: 'smooth' });
    nextIndex(index)
  }
  return (<></>
    // <div className=" pg-tabs-description mt-3" onClick={() => handleClick(Index)}>
    //   <div className="tabs-deschovr d-flex align-items-center rounded">
    //     <div className="pg-sb-topic d-flex align-items-center" style={{ width: "97%" }}>
    //       <span className="videoimage">

    //         <img src={item.image_icon && item.image_icon.length ? item.image_icon : item.image} height={'60px'} />
    //         {/* <img src={item} height={'50px'}/>
    //         <i className="fa fa-file-text" aria-hidden="true"></i>  */}
    //       </span>

    //       {/* <h3>{item.title}</h3> */}
    //       <div className="subjectDetails">
    //         <p className='m-0 sub_name'>{item.title}</p>
    //         {item.role == "subject" && <p className='m-0 sub_topics'>{item.content} Topics</p>}
    //         {item.role == "topic" && <p className='m-0 sub_topics'>{item.content} video's</p>}
    //       </div>
    //     </div>
    //     <div className="pg-sb-topic pe-2">
    //       <span className="videoimage text-center">
    //         {/* {item.is_locked == '0' ?   */}
    //         {/* <i className="fa fa-angle-right" aria-hidden="true"></i> */}
    //         <IoIosArrowForward />
    //         {/* :  <img src={lock_icon}/>} */}
    //       </span>
    //     </div>
    //   </div>
    // </div>
  )
}

export default VideoTab;
