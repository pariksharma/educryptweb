import React, { useState, useEffect, forwardRef } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import LoginModal from '../modal/loginModal';
import { footerService } from '@/services';
import { userLoggedIn } from '@/utils/helpers';

const eduLogo1 = '/assets/images/eduLogo1.png'
const playStoreLogo = '/assets/images/googleStore.png';
const appleStoreLogo = '/assets/images/appleStore.png';
const windowsLogo = '/assets/images/windows.png';


const Footer = forwardRef((props, ref) => {

  const [isLoading, setIsLoading] = useState(false)
  const [modalShow, setModalShow] = useState(false)
  const [footerLinks, setFooterLinks] = useState('')
  const router = useRouter();
  const footerData = useSelector((state) => state.allCategory?.allCategory?.course_type_master)
  const appDetail = useSelector((state) => state?.appDetail?.app_detail);

  useEffect(() => {
    setIsLoading(true);
    fetchFooterService();
  }, [])

  // console.log('appDetail', appDetail)

  const handleBlog = () => {
    const isLoggedIn = userLoggedIn();
    if (isLoggedIn) {
      router.push('/private/myProfile/Blog');
    }
    else {
      setModalShow(true)
    }
  }

  const fetchFooterService = async () => {
    try {
      const formData = {}
      const response_footer_service = await footerService()
      if (response_footer_service.status == 200) {
        setFooterLinks(response_footer_service.data)
      }
      // console.log(response_footer_service)
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  return (
    <>
      {/* {isLoading &&  */}
      <LoginModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
        }}
      />
      <footer className="footerSection" ref = {ref}>
        <div className="container-fluid py-3 p-0">
          <div className="row gap-3 gap-md-0 gap-lg-5 px-5 mx-auto justify-content-start">
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
              <div className="footerLogo">
                {eduLogo1 && <img src={appDetail?.web_logo ? appDetail?.web_logo : eduLogo1} alt="" className="" />}
              </div>
              <div className="m-0 mb-2 orgName">
                {appDetail?.title ? appDetail?.title : 'Educrypt Edu Solutions Pvt. Ltd.'}
              </div>
              {appDetail?.address &&
                <div className="m-0 mb-2 orgAddress">
                  <span className="text-white fw-semibold">Address:</span> <br />
                  {appDetail?.address}
                </div>
              }
              {appDetail?.owner_mobile &&
                <div className="m-0 mb-2 mobNumber">
                  <span className="text-white fw-semibold">Phone:</span> <br />
                  {appDetail?.owner_mobile}
                </div>
              }
              {appDetail?.owner_email &&
                <div className="m-0 mb-2 emailAddress">
                  <span className="text-white fw-semibold">Email:</span> <br />
                  {appDetail?.owner_email}
                </div>
              }
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
              <h4 className="m-0 my-3 footTitle">Comapany</h4>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/about-us" className="text-decoration-none" >
                    About Us
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/contact-us" className="text-decoration-none">
                    Contact Us
                  </Link>
                </li>
                {/* <li className="mb-2">
                  <Link href="#" className="text-decoration-none">
                    Media
                  </Link>
                </li> */}
                {/* <li className="mb-2">
                  <Link href="/career" className="text-decoration-none">
                    Career
                  </Link>
                </li>
                <li className="mb-2">
                  <a className="text-decoration-none" style={{ cursor: 'pointer' }} onClick={handleBlog}>
                    Blog
                  </a>
                </li> */}
              </ul>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
              <h4 className="m-0 my-3 footTitle">Products</h4>
              <ul className="list-unstyled">
                {footerData && footerData.map((item, index) => {
                  return <li className="mb-2" key={index}>
                    <Link className="text-decoration-none" href={`/view-courses/${item.name + ':' + item.id}`}>
                      {item.name}
                    </Link>
                  </li>
                })}
              </ul>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
              <h4 className="m-0 my-3 footTitle">Help & Support</h4>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/FAQ's" className="text-decoration-none">
                    FAQ's
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/privacy-policy" className="text-decoration-none">
                    Privacy Policy
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/terms&condition" className="text-decoration-none">
                    Terms & Conditions
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/refund-policy" className="text-decoration-none">
                    Refund/Cancellation Policy
                  </Link>
                </li>
                {/* <li className="mb-2">
                  <Link href="/cancellation-policy" className="text-decoration-none">
                    Cancellation Policy
                  </Link>
                </li> */}
              </ul>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-2">
              <h4 className="m-0 my-3 footTitle">Download App</h4>
              <ul className="list-unstyled d-flex flex-column">
                <a href={`${footerLinks?.gplay_detail}`} className="mb-2">
                  {playStoreLogo && (
                    <img style={{ width: "96px" }} src={playStoreLogo} alt="" />
                  )}
                </a>
                <a href={`${footerLinks?.app_store_link}`} className="mb-2">
                  {appleStoreLogo && (
                    <img
                      style={{ width: "96px" }}
                      src={appleStoreLogo}
                      alt=""
                    />
                  )}
                </a>
                <a href={`${footerLinks?.windows_store_link32}`} className="mb-2">
                  {windowsLogo && (
                    <img style={{ width: "96px" }} src={windowsLogo} alt="" />
                  )}
                </a>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="footerBottom gap-2 gap-sm-4 d-flex flex-wrap align-items-center               justify-content-between justify-content-sm-between justify-content-md-between"
        >
          <p className="mb-2 copyrighttitle">
            {appDetail?.title ? appDetail?.title : 'EduCrypt'} All Right Reserved, 2022
          </p>
          <div className="mb-2 flex-wrap foot-social">
            {footerLinks?.twitter_detail && (
              <a
                href={footerLinks.twitter_detail}
                className="m-0 text-decoration-none social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-twitter"></i>
              </a>
            )}

            {footerLinks?.facebook_detail && (
              <a
                href={footerLinks.facebook_detail}
                className="m-0 text-decoration-none social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
            )}

            {footerLinks?.instagram_detail && (
              <a
                href={footerLinks.instagram_detail}
                className="m-0 text-decoration-none social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-instagram"></i>
              </a>
            )}

            {footerLinks?.telegram_detail && (
              <a
                href={footerLinks.telegram_detail}
                className="m-0 text-decoration-none social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-send-fill"></i>
              </a>
            )}

            {footerLinks?.linkedIn_detail && (
              <a
                href={footerLinks.linkedIn_detail}
                className="m-0 text-decoration-none social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            )}
          </div>

        </div>
      </footer>
      {/* } */}
    </>
  );
})

export default Footer