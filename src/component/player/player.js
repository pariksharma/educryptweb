import React, { useEffect, useRef, useState } from "react";
import { MdOutlineChevronLeft } from "react-icons/md";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';
import 'shaka-player/dist/controls.css';


const VideoJsPlayer = ({ source, dType, poster, keySystem, NonDRMVideourl, videoMetaData, title, start_date, video_type, setTogglePlayPause, bookmarkTime, getValue, trigger }) => {

  // console.log("NonDRMVideourl", NonDRMVideourl)
  // console.log("start_date", start_date)
  // console.log("video_type", video_type)

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSkipIcon, setShowSkipIcon] = useState(false);
  const [showSkipIconBack, setshowSkipIconBack] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [iconType, setIconType] = useState('play'); // 'play' or 'pause'
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [showIntro, setshowIntro] = useState(false);
  const [showSkipRecap, setshowSkipRecap] = useState(false);
  const [cursorStyle, setCursorStyle] = useState('');
  const [Live, setLive] = useState(false);
  const currentTimeRef = useRef(currentTime); // Ref to keep track of currentTime
  const [videoState, setVideoState] = useState("0:00");

  const router = useRouter()

  // const formatTime = (time) => {
  //   const minutes = Math.floor(time / 60);
  //   const seconds = Math.floor(time % 60);
  //   return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  // };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
  
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    } else {
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
  };

  const parseTime = (formattedTime) => {
    if (!formattedTime) return 0; // Default to 0 for invalid input
  
    const timeParts = formattedTime.split(':').map(Number); // Convert parts to numbers
  
    if (timeParts.length === 3) {
      // Format: hh:mm:ss
      const [hours, minutes, seconds] = timeParts;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (timeParts.length === 2) {
      // Format: mm:ss
      const [minutes, seconds] = timeParts;
      return minutes * 60 + seconds;
    } else {
      console.error('Invalid time format:', formattedTime);
      return 0; // Default to 0 if format is incorrect
    }
  };


  
  useEffect(() => {
    console.log('click')
    if (bookmarkTime && videoRef.current) {
      const timeInSeconds = parseTime(bookmarkTime);
  
      if (Number.isFinite(timeInSeconds)) { // Ensure valid time
        console.log('Setting currentTime to:', timeInSeconds);
        videoRef.current.currentTime = timeInSeconds; // Seek to bookmark time
        videoRef.current.play(); // Start playing the video
      } else {
        console.error('Invalid bookmarkTime:', bookmarkTime);
      }
    }
  }, [bookmarkTime, trigger]);

  useEffect(() => {
    currentTimeRef.current = currentTime; // Update the ref with the latest currentTime
  }, [currentTime]);

  useEffect(() => {
    const videoElement = videoRef.current;

    // Retrieve and apply the stored mute state from localStorage when the video player loads
    const storedMuteState = localStorage.getItem('isMuted');
    if (storedMuteState !== null) {
      videoElement.muted = storedMuteState === 'true';
    }

    // Save the mute state to localStorage whenever the user mutes/unmutes the video
    const handleVolumeChange = () => {
      const isMuted = videoElement.muted;
      localStorage.setItem('isMuted', isMuted ? 'true' : 'false');
    };

    if (videoElement) {
      videoElement.addEventListener("volumechange", handleVolumeChange);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("volumechange", handleVolumeChange);
      }
    };
  }, []);




  useEffect(() => {
    const updateCursorStyle = () => {
      const controlsContainer = document.querySelector('.shaka-controls-container');
      if (controlsContainer) {
        const isShown = controlsContainer.getAttribute('shown') === 'true';
        if (isShown) {
          setCursorStyle('auto');
        } else {
          setCursorStyle('none');
        }
      }
    };
    updateCursorStyle();
    const observer = new MutationObserver(updateCursorStyle);
    const targetNode = document.querySelector('.shaka-controls-container');
    if (targetNode) {
      observer.observe(targetNode, { attributes: true, attributeFilter: ['shown'] });
    }
    return () => {
      if (targetNode) {
        observer.disconnect();
      }
    };
  }, [videoRef.current]);

  const handleSkipEnd = () => {
    const video = videoRef.current;
    video.currentTime = videoMetaData?.skip_end;
    setshowIntro(false);
  };

  const handleSkipRecapEnd = () => {
    const video = videoRef.current;
    video.currentTime = videoMetaData?.recap_end;
    setshowSkipRecap(false);
  }

  useEffect(() => {
    const shaka = require('shaka-player/dist/shaka-player.ui.js');
    const handleLoaded = () => {
      setLoading(false);
      setIsPlaying(!videoRef.current?.paused);
      setDuration(videoRef.current?.duration);
    };

    const handleError = (event) => {
    };

    const initPlayer = async () => {
      const videoElement = videoRef.current;
      const videoContainer = containerRef.current;
      const player = new shaka.Player(videoElement);
      playerRef.current = player;
      const ui = new shaka.ui.Overlay(player, videoContainer, videoElement);
      const controls = ui.getControls();

      const container = controls.getServerSideAdContainer();
      const netEngine = player.getNetworkingEngine();
      const adManager = player.getAdManager();
      adManager.initMediaTailor(container, netEngine, videoElement);
      setPlayer(player);
      const config = {
        'enableTooltips': true,
        'overflowMenuButtons': ['quality', 'caption', 'language'],
        //'controlPanelElements': ['backward', 'play_pause', 'forward', 'spacer', 'mute', 'overflow_menu', 'fullscreen']
      }
      ui.configure(config);
      videoRef.current.addEventListener("loadeddata", handleLoaded);
      videoRef.current.addEventListener("error", handleError);
      videoRef.current.addEventListener("play", () => {
        setIsPlaying(true);
        setIconType('pause');
        setShowIcon(true);
        setTimeout(() => setShowIcon(false), 1000); // Show icon for 1 second
      });
      videoRef.current.addEventListener("pause", () => {
        setIsPlaying(false);
        setIconType('play');
        setShowIcon(true);
        setTimeout(() => setShowIcon(false), 1000); // Show icon for 1 second
      });
      videoRef.current.addEventListener("timeupdate", () => setCurrentTime(videoRef.current?.currentTime));
      videoRef.current.addEventListener("click", togglePlayPause); // Play/Pause on video click
      // Configure DRM
      if (dType === 1 || dType === 3) {
        player.configure({
          drm: {
            servers: {
              [keySystem]: `https://license.videocrypt.com/validateLicense?pallyconCustomdataV2=${source?.token}`,
            },
          },
        });
        player.getNetworkingEngine().registerRequestFilter((type, request) => {
          request.headers["pallycon-customdata-v2"] = source?.token;
        });
      }
      try {
        if (NonDRMVideourl) {
          player.getNetworkingEngine().registerRequestFilter((type, request) => {
            if (type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
              type === shaka.net.NetworkingEngine.RequestType.SEGMENT) {
              request.method = 'GET';
            }
          });
          // await player.load("https://livesim.dashif.org/livesim/chunkdur_1/ato_7/testpic4_8s/Manifest.mpd");
          if (start_date) {
            player.load(`${source?.file_url}?start=${start_date}`).then(function () {
              if (player.isLive()) {
                setLive(false)
              }
              else {
                var seekBar = controls.getControlsContainer().querySelector('.shaka-seek-bar-container');
                var seekBar2 = controls.getControlsContainer().querySelector('.shaka-current-time');
                if (seekBar) {
                  // seekBar.remove();
                  seekBar2.remove();
                }
                setLive(true)
              }
            }).catch((err) => {
            })
          } else {
            player.load(NonDRMVideourl).then(function () {
              if (player.isLive()) {
                setLive(false)
              }
              else {
                var seekBar = controls.getControlsContainer().querySelector('.shaka-seek-bar-container');
                var seekBar2 = controls.getControlsContainer().querySelector('.shaka-current-time');
                if (seekBar) {
                  // seekBar.remove();
                  seekBar2.remove();
                }
                setLive(true)
              }
            }).catch((err) => {
            })
          }

          // player.load(`${source?.file_url}?start=${start_date}`).then(function() {
          // }).catch((err)=>{
          // })

        } else {
          if (start_date) {
            const mediaTailorUrl = `${source?.file_url}?start=${start_date}`;
            // const mediaTailorUrl = source?.file_url;
            await player.load(mediaTailorUrl).then(() => {
              if (player.isLive()) {
                setLive(false)
              }
              else {
                var seekBar = controls.getControlsContainer().querySelector('.shaka-seek-bar-container');
                var seekBar2 = controls.getControlsContainer().querySelector('.shaka-current-time');
                if (seekBar) {
                  // seekBar.remove();
                  seekBar2.remove();
                }
                setLive(true)
              }
            }).catch((error) => {
              console.log('Error Loading video', error)
            });
            videoRef.current.play();

          } else {
            const mediaTailorUrl = source?.file_url;
            await player.load(mediaTailorUrl).then(() => {
              if (player.isLive()) {
                setLive(false)
              }
              else {
                var seekBar = controls.getControlsContainer().querySelector('.shaka-seek-bar-container');
                var seekBar2 = controls.getControlsContainer().querySelector('.shaka-current-time');
                if (seekBar) {
                  // seekBar.remove();
                  seekBar2.remove();
                }
                setLive(true)
              }
            }).catch((error) => {
              console.log('Error Loading video', error)
            });
            videoRef.current.play();
          }
          // const mediaTailorUrl = source?.file_url;
          // const mediaTailorUrl = url;

        }
      } catch (error) {

      }

    };
    if (video_type == 8) {
      const updateCurrentTimeButtonText = () => {
        const currentTimeButton = document.querySelector('.shaka-current-time');
        if (currentTimeButton) {
          // Check if the button's current text is "Live"
          if (currentTimeButton.textContent !== 'Live') {
            currentTimeButton.textContent = 'Go Live';
            currentTimeButton.setAttribute('aria-label', 'Go Live'); // Update aria-label for accessibility
          }
        }
      };
      updateCurrentTimeButtonText();
      const observer = new MutationObserver(() => {
        const currentTimeButton = document.querySelector('.shaka-current-time');
        if (currentTimeButton && currentTimeButton.textContent !== 'Live') {
          updateCurrentTimeButtonText();
        }
      });
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    initPlayer();
    const handleKeyPress = (event) => {
      const activeElement = document.activeElement;
      const isInputField = 
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.isContentEditable;

      if (isInputField) {
        return; // Allow normal typing behavior
      }
      if (event.key === 'ArrowRight') {
        if (Live) {
          skipForward();
        }
      } else if (event.key === 'ArrowLeft') {
        if (Live) {
          skipBackward();
        }
      } else if (event.key === ' ') { // Space key for play/pause
        event.preventDefault(); // Prevent scrolling the page
        event.stopPropagation(); 
        // togglePlayPause();
      } else if (event.key === 'ArrowUp') { // Increase volume
        setVolume(prevVolume => {
          const newVolume = Math.min(prevVolume + 0.1, 1);
          videoRef.current.volume = newVolume;
          return newVolume;
        });
      } else if (event.key === 'ArrowDown') { // Decrease volume
        setVolume(prevVolume => {
          const newVolume = Math.max(prevVolume - 0.1, 0);
          videoRef.current.volume = newVolume;
          return newVolume;
        });
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("loadeddata", handleLoaded);
        videoRef.current.removeEventListener("error", handleError);
        videoRef.current.removeEventListener("click", togglePlayPause); // Clean up event listener
      }
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [dType, keySystem, source?.token, source?.file_url,Live]);

  const skipForward = () => {
    videoRef.current.currentTime += 10;
    setShowSkipIcon(true);
    setTimeout(() => setShowSkipIcon(false), 1000);
  };

  const skipBackward = () => {
    videoRef.current.currentTime -= 10;
    setshowSkipIconBack(true);
    setTimeout(() => setshowSkipIconBack(false), 1000);
  };

  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      // setVideoState(formatTime(currentTime));
    } else {
      videoRef.current.pause();
      const currTime = videoRef.current.currentTime;
      // console.log('currTime', currTime)
      setVideoState(formatTime(currTime));
    }
  };
  

  useEffect(() => {
    // Pass the togglePlayPause function to the parent
    console.log('currTime', videoRef.current.currentTime)
    setTogglePlayPause(() => ({
      action: togglePlayPause,
      state: formatTime(videoRef.current.currentTime),
    }));
  }, [setTogglePlayPause, videoState]);


  useEffect(() => {
    getValue(videoRef.current.currentTime)
  }, [currentTime])

  // console.log('currentTime', formatTime(currentTime))
  

  return (
    <div ref={containerRef} id="videoContainer">
      <div className="__player__">
        <div className="container-fluid player_top_back_">
          <div className="row m-0">
            <div className="mx-auto">
              <div className="helpHead d-flex align-items-center audio-player__top" style={{ cursor: 'pointer', zIndex: "9999" }}>
                {/* <MdOutlineChevronLeft onClick={() => router.back()} /> */}
                <svg onClick={() => router.back()} width="13" height="20" viewBox="0 0 13 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_5517_7385)">
                  <path d="M10.1323 -0.0117188C9.78246 0.122427 9.47213 0.337541 9.22872 0.614684C6.30441 3.44764 3.37133 6.27873 0.429475 9.10792C0.249499 9.25212 0.11846 9.44508 0.053298 9.66187C-0.0118628 9.87866 -0.00815201 10.1093 0.0639362 10.3241C0.133602 10.5063 0.243334 10.6719 0.385603 10.8094C3.42299 13.7533 6.46525 16.6935 9.51239 19.6299C9.61856 19.745 9.74875 19.837 9.8944 19.9C10.0401 19.9631 10.1979 19.9957 10.3575 19.9957C10.5172 19.9957 10.675 19.9631 10.8206 19.9C10.9663 19.837 11.0965 19.745 11.2026 19.6299C11.4453 19.4042 11.6881 19.1785 11.9074 18.9302C12.0828 18.7329 12.1773 18.4804 12.173 18.2205C12.1687 17.9605 12.0659 17.7111 11.884 17.5193C11.8284 17.4572 11.767 17.3952 11.7056 17.3359L4.28372 10.1802C4.19817 10.1084 4.11984 10.0291 4.04978 9.94314C4.12641 9.91486 4.19833 9.87587 4.26324 9.82745C6.76451 7.41774 9.26382 5.00709 11.7612 2.5955C12.2291 2.14403 12.3197 1.52327 11.9366 1.10284C11.5536 0.682416 11.1792 0.202722 10.5827 -0.000438266L10.1323 -0.0117188Z" fill="white"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_5517_7385">
                  <rect width="12.1739" height="20" fill="white" transform="matrix(-1 0 0 1 12.1738 0)"/>
                  </clipPath>
                  </defs>
                </svg>
                <h3 className="text-white ms-4 w-100 mb-0"> {title}</h3>
              </div>
            </div>
          </div>
        </div>
        <div ref={containerRef} className="video_bg_color">
          <video
            ref={videoRef}
            autoPlay
            // muted={VolumeButton}
            controls
            poster={poster}
            style={{ width: "100%" }}
          />
        </div>
        {/* {!Live &&
          <div className="time_video-custome">
            <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
          </div>
        } */}
        {showSkipIcon && (
          <div className="skip-icon __skip_icon____">
            <p>▶▶▶</p>
            <p>10 Seconds</p>
          </div>
        )}
        {showSkipIconBack && (
          <div className="skip-icon __skip_icon_back____">
            <p>◀◀◀</p>
            <p>10 Seconds</p>
          </div>
        )}
        {showIcon && (
          <div className={`icon-overlay ${iconType === 'play' ? 'play-icon' : 'pause-icon'} show`}>
            <img src={`/assets/images/${iconType}.svg`} alt={iconType} />
          </div>
        )}
        <div className="skip_intro_main_wrap">
          {showIntro && <button type="button" className="skip_intro_main" onClick={handleSkipEnd}>Skip Intro</button>}
          {showSkipRecap && <button type="button" className="skip_intro_main" onClick={handleSkipRecapEnd}>
            Skip Recap</button>}
        </div>
        {cursorStyle == "auto" &&
          <>
            {/* {Live ?  <span className="liveIndicator">Live</span> : ""} */}
            <div className="_controls_video_">
              {Live &&
                <div className={`time_video-custome`}>
                  <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
                </div>
              }
              <div className="__video-deu__">
              </div>

              <div className="__video_icon___">
                <div className="video_icon_left shaka-tooltips-on">
                  {!isAdPlaying && Live &&
                    <div onClick={skipBackward} className="__video_icon__common__ shaka-tooltip" aria-label="Rewind 10 seconds">
                      {/* <img src="/assets/images/skip_02.svg" alt="Rewind 10 seconds" /> */}
                      <svg width="26" height="18" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.26259 7.35765C1.00313 11.4133 0.770111 18.2267 4.74212 22.5759C8.71412 26.925 15.387 27.163 19.6465 23.1073C23.906 19.0517 24.139 12.2382 20.167 7.88908C17.9077 5.41527 14.7746 4.27159 11.7088 4.4916M13.2078 2L10.5219 4.61502L13.2078 7.41937" stroke="#E8E8E8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9.8671 11.7273V19H8.54963V13.0092H8.50701L6.80602 14.0959V12.8885L8.61355 11.7273H9.8671ZM14.4019 19.1385C13.8171 19.1385 13.3153 18.9905 12.8962 18.6946C12.4796 18.3963 12.1588 17.9666 11.9339 17.4055C11.7113 16.8421 11.6001 16.1638 11.6001 15.3707C11.6024 14.5777 11.7149 13.9029 11.9374 13.3466C12.1623 12.7879 12.4831 12.3617 12.8998 12.0682C13.3188 11.7746 13.8195 11.6278 14.4019 11.6278C14.9843 11.6278 15.485 11.7746 15.904 12.0682C16.3231 12.3617 16.6439 12.7879 16.8664 13.3466C17.0913 13.9053 17.2037 14.58 17.2037 15.3707C17.2037 16.1662 17.0913 16.8456 16.8664 17.4091C16.6439 17.9702 16.3231 18.3987 15.904 18.6946C15.4874 18.9905 14.9867 19.1385 14.4019 19.1385ZM14.4019 18.027C14.8564 18.027 15.2151 17.8033 15.4779 17.3558C15.743 16.906 15.8756 16.2443 15.8756 15.3707C15.8756 14.7931 15.8153 14.3078 15.6945 13.9148C15.5738 13.5218 15.4033 13.2259 15.1831 13.027C14.963 12.8258 14.7026 12.7251 14.4019 12.7251C13.9497 12.7251 13.5922 12.95 13.3295 13.3999C13.0667 13.8473 12.9341 14.5043 12.9317 15.3707C12.9294 15.9508 12.9874 16.4384 13.1057 16.8338C13.2265 17.2292 13.3969 17.5275 13.6171 17.7287C13.8373 17.9276 14.0989 18.027 14.4019 18.027Z" fill="#E8E8E8"/>
                      </svg>
                      </div>
                  }
                  <div onClick={togglePlayPause}
                    className={`${isAdPlaying ? "__ads__" : "__adds__"} __play_pause__ shaka-tooltips-on`}>
                    {isPlaying ? (
                      <span className="shaka-tooltip" aria-label="Pause">
                        {/* <img src="/assets/images/pause.svg" /> */}
                        <svg width="24" height="20" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.8352 1.66667C14.8352 0.746193 15.5732 0 16.4835 0H21.4286C22.3389 0 23.0769 0.746192 23.0769 1.66667V28.3333C23.0769 29.2538 22.3389 30 21.4286 30H16.4835C15.5732 30 14.8352 29.2538 14.8352 28.3333V1.66667Z" fill="white"/>
                          <path d="M0 1.66667C0 0.746193 0.737992 0 1.64835 0H6.59341C7.50377 0 8.24176 0.746192 8.24176 1.66667V28.3333C8.24176 29.2538 7.50377 30 6.59341 30H1.64835C0.737992 30 0 29.2538 0 28.3333V1.66667Z" fill="white"/>
                        </svg>
                      </span>
                    ) : (
                      <span className="shaka-tooltip" aria-label="Play">
                        {/* <img src="/assets/images/play.svg" /> */}
                        <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24.498 12.2368C26.498 13.3915 26.498 16.2783 24.498 17.433L12.2506 24.5041C10.2506 25.6588 7.75055 24.2154 7.75055 21.906L7.75055 7.76383C7.75055 5.45442 10.2505 4.01105 12.2505 5.16575L24.498 12.2368Z" fill="white"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  {!isAdPlaying && Live &&
                    <div onClick={skipForward} className="__video_icon__common__ shaka-tooltip" aria-label="Forward 10 seconds">
                      {/* <img src="/assets/images/skip_01.svg" alt="Forward 10 seconds" /> */}
                      <svg width="25" height="18" viewBox="0 0 25 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.7374 7.35765C23.9969 11.4133 24.2299 18.2267 20.2579 22.5759C16.2859 26.925 9.61295 27.163 5.3535 23.1073C1.09404 19.0517 0.86102 12.2382 4.83303 7.88908C7.09231 5.41527 10.2254 4.27159 13.2912 4.4916M11.7922 2L14.4781 4.61502L11.7922 7.41937" stroke="#E8E8E8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10.8671 11.7273V19H9.54963V13.0092H9.50701L7.80602 14.0959V12.8885L9.61355 11.7273H10.8671ZM15.4019 19.1385C14.8171 19.1385 14.3153 18.9905 13.8962 18.6946C13.4796 18.3963 13.1588 17.9666 12.9339 17.4055C12.7113 16.8421 12.6001 16.1638 12.6001 15.3707C12.6024 14.5777 12.7149 13.9029 12.9374 13.3466C13.1623 12.7879 13.4831 12.3617 13.8998 12.0682C14.3188 11.7746 14.8195 11.6278 15.4019 11.6278C15.9843 11.6278 16.485 11.7746 16.904 12.0682C17.3231 12.3617 17.6439 12.7879 17.8664 13.3466C18.0913 13.9053 18.2037 14.58 18.2037 15.3707C18.2037 16.1662 18.0913 16.8456 17.8664 17.4091C17.6439 17.9702 17.3231 18.3987 16.904 18.6946C16.4874 18.9905 15.9867 19.1385 15.4019 19.1385ZM15.4019 18.027C15.8564 18.027 16.2151 17.8033 16.4779 17.3558C16.743 16.906 16.8756 16.2443 16.8756 15.3707C16.8756 14.7931 16.8153 14.3078 16.6945 13.9148C16.5738 13.5218 16.4033 13.2259 16.1831 13.027C15.963 12.8258 15.7026 12.7251 15.4019 12.7251C14.9497 12.7251 14.5922 12.95 14.3295 13.3999C14.0667 13.8473 13.9341 14.5043 13.9317 15.3707C13.9294 15.9508 13.9874 16.4384 14.1057 16.8338C14.2265 17.2292 14.3969 17.5275 14.6171 17.7287C14.8373 17.9276 15.0989 18.027 15.4019 18.027Z" fill="#E8E8E8"/>
                      </svg>
                      </div>}
                </div>
              </div>
            </div>
          </>
        }

      </div>
    </div>
  );
};

export default VideoJsPlayer;
