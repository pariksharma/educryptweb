import React, { useState, useEffect } from "react";
import SliderContent from "../slider/sliderContent/sliderContent";
import Slider from "react-slick";
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ScreenWidth } from "../../utils/helpers";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/router";

const FreeContent = ({value, titleName, onlineCourseDetailID}) => {
  const [showSlide, setShowSlide] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(value);
  const router = useRouter();

  // console.log('title', title)

  useEffect(() => {
    const changeWidth = () => {
      setShowSlide(ScreenWidth());
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

  const duplicateCourses = () => {
    if (data.length < 4) {
        const duplicated = [...data];
        while (duplicated.length < 4) {
            duplicated.push(...data);
        }
        return duplicated;
    }
    return data;
};

  const settings = {
    dots: false,
    autoplay: true,
    infinite: true,
    speed: 500,
    slidesToShow: showSlide,
    slidesToScroll: 1,
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

  return (
    <>
      {/* {true ? ( */}
        <Slider {...settings}>
          {duplicateCourses().map((item, index) => (
            <SliderContent freeCourse={item} titleName={titleName} key={index} />
          ))}
        </Slider>
      {/* ) : (
        <div>Loading...</div> // Static fallback content for SSR
      )} */}
    </>
  );
};

export default FreeContent;
