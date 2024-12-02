import React, { useState, useEffect } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { decrypt, encrypt, get_token } from '@/utils/helpers';
import { getContentMeta } from '@/services';
import Loader from '../loader';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';


const Bookmark = ({chat_node, course_id, video_id, handleBookMark}) => {

  const [publicChat, setPublicChat] = useState(null);
  const [isFireBase, setIsFireBase] = useState(null);
  const [chatNode, setChatNode] = useState(null);
  const [settingNode, setSettingNode] = useState(null);
  const [port, setPort] = useState(null);
  const [listenURL, setListenURL] = useState(null);
  const [showChat, setShowChat] = useState(false)
  const [pdfData, setPdfData] = useState([]);
  const [locked_room, setLocked_room] = useState('');
  const [pollData, setPollData] = useState('')
  const [key, setKey] = useState("Bookmark");

  const router = useRouter()

  useEffect(() => {
    fetchContentMeta()
  }, [video_id])

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

//   console.log('key222', key)

  return (
    <>
  
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
                            <button onClick={()=>handleBookMark()}>Add Bookmark</button>
                        </>
                      :
                        <Loader />
                    )
                }
              </Tab>
              <Tab eventKey="Index" title="Index">
                {key === "Index"  && (
                    showChat ?
                    <></>
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
