import React, { useEffect, useState, Suspense, lazy } from "react";
// import { prod_Ary } from "../../../public/assets/sampleArry";
// import SliderProduct from "../slider/sliderProduct/sliderProduct";
import Slider from "react-slick";
import Loader from "../loader";
import * as Icon from "react-bootstrap-icons";
import { get_token, ProdscreenWidth } from "../../utils/helpers";
import { useSelector } from "react-redux";
import { isValidData, encrypt, decrypt } from "../../utils/helpers";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getFaculty_Service } from "@/services";
import { useRouter } from "next/router";
import { classNames } from "@react-pdf-viewer/core";
import "bootstrap-icons/font/bootstrap-icons.css";

const SliderProduct = lazy(() => import("../slider/sliderProduct/sliderProduct"));

const OurProduct = ({ value, data }) => {
  const [showSlide, setShowSlide] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const prod_Ary = useSelector((state) => state.allCategory.allCategory.course_type_master)
  const status = isValidData(prod_Ary)
  const [facultyAry, setfacultyAry] = useState('')
  const router = useRouter()
  // console.log('prod_Ary', prod_Ary)


  useEffect(() => {
    const changeWidth = () => {
      setShowSlide(ProdscreenWidth());
    };

    if (typeof window !== "undefined") {
      changeWidth();
      window.addEventListener("resize", changeWidth);

      setTimeout(() => {
        setIsLoading(true);
      }, 0);

      return () => {
        window.removeEventListener("resize", changeWidth);
      };
    }
  }, []);

  useEffect(() => {
    if(value === "faculties"){
      fetchFaculty();
    }
  }, [])

  const settings = {
    dots: false,
    autoplay: true,
    infinite: value === "faculties" ? false : (prod_Ary?.length > 3 ? true : false),
    className:'left',
    speed: 500,
    arrows: value === "faculties" ? facultyAry?.length > 3 ? true: false : prod_Ary?.length > 3 ? true : false,
    slidesToScroll: 1,
    slidesToShow: showSlide,
    nextArrow: <Icon.ChevronRight />,
    prevArrow: <Icon.ChevronLeft />,
    responsive: [
      {
        breakpoint: 1200, // Adjust to your desired breakpoint
        settings: {
          slidesToShow: 4, // Number of slides to show at this breakpoint
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024, // Adjust to your desired breakpoint
        settings: {
          slidesToShow: 4, // Number of slides to show at this breakpoint
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992, // Adjust to your desired breakpoint
        settings: {
          slidesToShow: 3, // Number of slides to show at this breakpoint
          slidesToScroll: 1,
          arrows: true
        },
      },
      {
        breakpoint: 768, // Another breakpoint for smaller screens
        settings: {
          slidesToShow: 2, // Number of slides to show at this breakpoint
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480, // Breakpoint for very small screens
        settings: {
          slidesToShow: 1, // Number of slides to show at this breakpoint
          slidesToScroll: 1,
        },
      },
    ],
  };

  const fetchFaculty = async () => {
    try{
      const token = get_token()
      const formData = new FormData();
      const response_faculty_service = await getFaculty_Service(formData);
      // console.log('response_faculty_service', response_faculty_service)
      const faculty_service_Data = decrypt(response_faculty_service.data, token)
      // console.log('faculty', faculty_service_Data)
      if(faculty_service_Data.status) {
        setfacultyAry(faculty_service_Data.data)
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  }

  if (value == "product") {
    return (
      <div className="container Product_container">
        {isValidData(prod_Ary) && <>
          <div className="heading_prod">
            <h1 className="main-title">Our Products</h1>
          </div>
          <div className="row align-items-center text-white prod_slider">
          <Suspense fallback={<Loader />}>
            {status && (
              <Slider {...settings}>
                {prod_Ary &&
                  prod_Ary.map((item, index) => (
                    <SliderProduct value={item} key={index} />
                  ))}
              </Slider>
            )}
            </ Suspense>
          </div>
        </>
        // : (
        //   <div className="row align-items-center justify-content-center sldr_container">
        //     <div className="spinner-border" role="status" /> 
        //   </div>
        // )
        }
      </div>
    );
  } else if (value == "faculties") {
    return <>
      {isValidData(facultyAry) && <>
        <div className="page-sect-2-title">
            <h1 className="head">Top Faculties</h1>
        </div>
    <div className="row align-items-center text-white prod_slider">   
      <Slider {...settings}>
        {facultyAry &&
          facultyAry.map((item, index) => (
            <div className="mb-3 ourfacultySection" key={index}>
              <div className="card">
                <div>
                  {item.profile_picture && (
                    <img className="facultyImg" src={item.profile_picture} alt="" />
                  )}
                </div>
                <div className="py-2 text-center">
                  <p className="m-0 faculty_name">{item.username}</p>
                  <p className="m-0 faculty_role">{item.experience}</p>
                </div>
              </div>
            </div>
          ))}
      </Slider>
    </div>
    </>}
    </>}
};

export default OurProduct;
