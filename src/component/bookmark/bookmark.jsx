import React, { useState, useEffect } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { decrypt, encrypt, get_token } from '@/utils/helpers';
import { getContentMeta } from '@/services';
import Loader from '../loader';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/router';


const Bookmark = ({video_id, handleBookMark, bookMarkData, indexData, handleCurrentTime, deleteBookMark, succesToastMsg, errorToastMsg, toastTrigger}) => {

  const [publicChat, setPublicChat] = useState(null);
  const [showChat, setShowChat] = useState(false)
  const [pdfData, setPdfData] = useState([]);
  const [key, setKey] = useState("Bookmark");
  const [bookmarkArry, setBookMarkArry] = useState([]);
  const [indexArry, setIndexArry] = useState([])

  const router = useRouter()

  useEffect(() => {
    fetchContentMeta()
  }, [video_id])

  useEffect(() => {
    if(succesToastMsg != "") {
      toast.success(succesToastMsg)
    }
    else if (errorToastMsg != "") {
      toast.error(errorToastMsg)
    }
  }, [succesToastMsg, errorToastMsg, toastTrigger])

  useEffect(() => {
    // if(bookMarkData?.length > 0) {
      setBookMarkArry(bookMarkData)
    // }
  }, [bookMarkData])

  useEffect(() => {
    setIndexArry(indexData)
  }, [indexData])

  useEffect(() => {
    // Function to apply overflow style based on viewport size
    const updateOverflowStyle = () => {
      const currentPath = window.location.pathname; // Get only the pathname, no query strings
      const viewportWidth = window.innerWidth;

      // Check if the URL matches the desired page
      if (currentPath.includes("/private/myProfile/play/")) {
        // Apply overflow: hidden for smaller devices (<= 1024px)
        if (viewportWidth >= 1024) {
          document.documentElement.style.overflow = "hidden";
        } else {
          document.documentElement.style.overflow = "auto"; // Remove overflow: hidden for larger devices
        }
      } else {
        document.documentElement.style.overflow = "auto"; // Reset for other pages
      }
    };

    // Apply the overflow style on mount
    updateOverflowStyle();

    // Listen for window resize events to update the overflow style dynamically
    window.addEventListener("resize", updateOverflowStyle);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", updateOverflowStyle);
    };
  }, []);

  const fetchContentMeta = async () => {
    try {
        const userId = localStorage.getItem('user_id') 
        const token = get_token();
        const formData = {
            token : video_id,
            user_id: userId
        }
        const response_contentMeta_service = await getContentMeta(encrypt(JSON.stringify(formData), token));
        const response_contentMeta_data = decrypt(response_contentMeta_service.data, token);
        console.log('response_contentMeta_data', response_contentMeta_data)
        if(response_contentMeta_data.status){
            const data = response_contentMeta_data?.data?.video;
            setShowChat(true)
            setPdfData(response_contentMeta_data?.data?.pdf)
            setBookMarkArry(response_contentMeta_data?.data?.bookmark)
            setIndexArry(response_contentMeta_data?.data?.index)   
        }
        else{
          setPublicChat(0)
          toast.error(response_contentMeta_data.message);
            if (
              response_contentMeta_data.message ==
              "You are already logged in with some other devices, So you are logged out from this device. 9"
            ) {
              localStorage.removeItem("jwt");
              localStorage.removeItem("user_id");
              localStorage.removeItem('userName')
              router.pathname.startsWith("/private")
                ? router.push("/")
                : location.reload();
            }
        }
    } catch (error) {
        console.log('error found: ', error)
    }
  }

  const handleRead = (value) => {
    if (typeof window !== "undefined") {
      window.open(value.pdf_url, "_blank");
    }
  };

  const formatOfTime = (timeString) => {
    const timeParts = timeString.split(':');
      const formattedParts = timeParts.map(part => part.padStart(2, '0'));
      return formattedParts.join(':');
  }

//   console.log('key222', key)

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="container-fluid">
        <div className="row liveChatTabs">
          <div className="card p-2 col-md-12">
            <Tabs
              activeKey={key}
              onSelect={(k) => setKey(k)}
              id="uncontrolled-tab-example"
              className="mb-3"
            >
              <Tab className="liveChat" eventKey="Bookmark" title="Bookmark">
                {
                  key == "Bookmark" && (
                    showChat ? 
                      <>
                        <div className="cardx p-2 col-md-12 d-flex flex-column" style={{ height: '100%' }}>
                          <div className="bookmark-container mt-2">
                          {bookmarkArry?.length > 0 && bookmarkArry?.map((bookmark, index) => {
                            return <div className='bookmark-box mb-2' key={index}>
                            <div className="d-flex justify-content-between">
                              <div className="d-flex gap-2">
                                <div style={{width:'40px;', cursor: 'pointer'}} onClick={() => handleCurrentTime(bookmark)} >
                                  <img src="/assets/images/playBookmark.svg" alt="" />
                                </div>
                                <div>
                                  <p className='org-text mb-0 mt-1'>{formatOfTime(bookmark?.time)}</p>
                                </div>
                                <div>
                                  {bookmark?.info?.length > 30 ? 
                                    <marquee className='black-txt mb-0 mt-1'>{bookmark?.info}</marquee>
                                    :
                                    <p className='black-txt mb-0 mt-1'>{bookmark?.info}</p>
                                  }
                                </div>
                                </div>
                                <div style={{cursor: 'pointer'}} onClick={() => deleteBookMark(bookmark?.id)}>
                                  <img src="/assets/images/removeBookMark.svg" alt="" />
                                </div>
                              </div>
                            </div>
                          })}
                          </div>
                          <div>
                            <button className="add-bookmark-btn text-center mt-3" onClick={()=>handleBookMark()}>Add Bookmark</button>
                          </div>
                          </div>
                        </>
                      :
                        <Loader />
                    )
                }
              </Tab>
              <Tab eventKey="Index" title="Index">
                {key === "Index"  && (
                    showChat ?
                    <>
                      <div className="bookmark-container mt-2">
                          {indexArry?.length > 0 && indexArry?.map((bookmark, index) => {
                            return <div className='bookmark-box mb-2' key={index}>
                            <div className="d-flex justify-content-between">
                              <div className="d-flex gap-2">
                                <div style={{width:'40px;', cursor: 'pointer'}} onClick={() => handleCurrentTime(bookmark)} >
                                  <img src="/assets/images/playBookmark.svg" alt="" />
                                </div>
                                <div>
                                  <p className='org-text mb-0 mt-1'>{bookmark?.time}</p>
                                </div>
                                <div>
                                  <p className='black-txt mb-0 mt-1'>{bookmark?.info}</p>
                                </div>
                                </div>
                              </div>
                            </div>
                          })}
                        </div>
                    </>
                    :
                    <Loader />
              )}
              </Tab>
              <Tab eventKey="PDF" title="PDF">
                {pdfData?.length > 0 && pdfData.map((pdf, index) => 
                  <div className="p-2 pdf-card mb-2" 
                    key={index} 
                    style={{cursor :'pointer'}} 
                    onClick={() => handleRead(pdf)}
                  >
                    <div className="d-flex align-items-center gap-2 flex-nowrap">
                      <div className="pdf_img_cont">
                        <img src={pdf?.pdf_thumbnail ? pdf?.pdf_thumbnail : "/assets/images/noImage.jfif"} alt="" />
                      </div>
                      <h4 className="m-0 pdf_title flex-fill">{pdf?.pdf_title}</h4>
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path>
                      </svg>
                    </div>
                  </div>
                )
                }
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bookmark;
