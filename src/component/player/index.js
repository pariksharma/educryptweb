import React, { useEffect, useState, useMemo, useCallback } from "react";
import VideoJsPlayer from "./player";
import axios from "axios";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import Loader from "../loader";
import Chat from "../chat/chat";

export default function VideoPlayerDRM({ vdc_id, media_id, NonDRMVideourl, item, title, videoMetaData,end_date,start_date,video_type }) {
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dType, setDType] = useState();
  const [keySystem, setKeySystem] = useState();
 

  const supportedDRMSystems = useCallback(async () => {
    if (typeof window === 'undefined' || typeof navigator.requestMediaKeySystemAccess !== "function") {
      return [];
    }

    const supportedConfig = [{
      initDataTypes: ["cenc"],
      videoCapabilities: [{ contentType: 'video/mp4;codecs="avc1.42E01E"' }],
    }];

    const drmSystems = ["com.microsoft.playready", "com.apple.fps", "com.apple.fps.1_0"];
    const supportedDRM = [];

    try {
      await Promise.all(drmSystems.map(drmSystem =>
        navigator.requestMediaKeySystemAccess(drmSystem, supportedConfig)
          .then(() => supportedDRM.push(drmSystem))
          .catch(() => { })
      ));
    } catch (error) {
    }

    return supportedDRM;
  }, []);

  const fetchDRMLicense = useCallback(async (D_id) => {
    try {
      const response = await axios.post(`https://api.videocrypt.com/getVideoDetailsDrm`, {
        name:vdc_id,
        flag:1,
      }, {
        headers: {
          "device-name": "1",
          "account-id": "10003323",
          "device-id": "71d3548555586126ed7071102e663619",
          "device-type": "1",
          "version": "2",
          'user-id':'22',
          'accessKey':'RkdaUjNNSjVENzFZQ1ZXWFQ4MjY=',
          'secretKey':'SE9LTldUN1I5OHZRbUFjay8zUGZMaGF5ZVpCVnRHNndGbERYeklZcw=='
        }
      });
      // if (response?.data?.status === false) {
      //   // toast.error(<Translate langKey={"No-data-found"} />, {
      //   //   position: "top-right",
      //   //   autoClose: 1000,
      //   //   hideProgressBar: false,
      //   //   closeOnClick: true,
      //   //   pauseOnHover: true,
      //   //   draggable: true,
      //   //   theme: "light",
      //   // });
      //   setTimeout(() => window.history.back(), 1000);
      //   return;
      // }
      setSource(response.data.data.link);
      setLoading(false);
    } catch (error) {
    }
  }, [vdc_id, media_id]);

  useEffect(() => {
    const initializePlayer = async () => {
      setLoading(true);
      if (NonDRMVideourl) {
        setSource({ file_url: NonDRMVideourl });
        setLoading(false);
        return;
      }
      const supportedDRM = await supportedDRMSystems();
      if (supportedDRM.length > 0) {
        for (let system of supportedDRM) {
          if (system === "com.apple.fps") {
            await fetchDRMLicense(2);
            setDType(2);
            setKeySystem("com.apple.fps");
            return;
          } else if (system === "com.microsoft.playready") {
            await fetchDRMLicense(3);
            setDType(3);
            setKeySystem("com.widevine.alpha");
            return;
          }
        }
      } else {
        await fetchDRMLicense(1);
        setDType(1);
        setKeySystem("com.widevine.alpha");
        setLoading(false);
      }
    };

    initializePlayer();
  }, [NonDRMVideourl, fetchDRMLicense, supportedDRMSystems]);

  const videoOptions = useMemo(() => ({
    autoplay: true,
    controls: true,
    responsive: true,
    playbackRates: [0.5, 1, 1.5, 2],
  }), []);

  return (
    <>
      {loading ? (
         <Loader />
      ) : (
        source && (
          <div className="__video_player__main___" style={{width: '100%', height: '100%'}}>
            <VideoJsPlayer
              autoPlay={true}
              source={source}
              keySystem={keySystem}
              options={videoOptions}
              dType={dType}
              poster={item?.detail_banner}
              title={title}
              NonDRMVideourl={NonDRMVideourl}
              videoMetaData={videoMetaData}
              start_date={start_date}
              end_date={end_date}
              video_type={video_type}
            />
          </div>

        )
      )}
      {/* <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      /> */}
    </>
  );
}
