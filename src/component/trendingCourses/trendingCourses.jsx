import React, { useState, useEffect } from 'react';
import Slider from "react-slick";
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ScreenWidth } from '../../utils/helpers';
import SliderTrend from '../slider/sliderTrend/sliderTrend';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector } from 'react-redux';
import { isValidData } from '../../utils/helpers';

const trendImg = '/assets/images/trending.svg';

const TrendingCourses = () => {
    const [showSlide, setShowSlide] = useState(4);
    const [isLoading, setIsLoading] = useState(false);
    const CourseData = useSelector((state) => state.allCategory.allCourse)
    const trendCourseAry = isValidData(CourseData) && CourseData.filter((item) => item.extra_json.is_trending == 1)
    const titleName = "Trending Courses"

    // console.log('CourseData4444', trendCourseAry)
    useEffect(() => {
      if (typeof window !== "undefined") {
        const changeWidth = () => {
            setShowSlide(ScreenWidth());
        };

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
      if (trendCourseAry.length < 4) {
          const duplicated = [...trendCourseAry];
          while (duplicated.length < 4) {
              duplicated.push(...trendCourseAry);
          }
          return duplicated;
      }
      return trendCourseAry;
  };

    const settings = {
        dots: false,
        autoplay: false,
        infinite: true,
        speed: 500,
        slidesToScroll: 1,
        slidesToShow: showSlide,
        nextArrow: <Icon.ChevronRight />,
        prevArrow: <Icon.ChevronLeft />,
        responsive: [
            {
              breakpoint: 1199, // Adjust to your desired breakpoint
              settings: {
                slidesToShow: 3, // Number of slides to show at this breakpoint
                slidesToScroll: 1,
              },
            },
            {
              breakpoint: 1024, // Adjust to your desired breakpoint
              settings: {
                slidesToShow: 3, // Number of slides to show at this breakpoint
                slidesToScroll: 1,
              },
            },
            {
              breakpoint: 992, // Adjust to your desired breakpoint
              settings: {
                slidesToShow: 2, // Number of slides to show at this breakpoint
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
        <div className='container trendContainer'>
          {isValidData(trendCourseAry) ? <>
            <div className='trending_heading'>
                {trendCourseAry && <img src={trendImg} alt='img' />}
                <h1 className="main-title">Trending Courses</h1>
            </div>
            <div className="row align-items-center justify-content-center sldr_container">
              <Slider {...settings}>
                  {duplicateCourses().map((item, index) => {
                      return <SliderTrend value={item} titleName = {titleName} key={index} />
                  })}
              </Slider>
            </div>
            </>
          : (
            <>
              {/* <div className="row align-items-center justify-content-center sldr_container">
                <div className="spinner-border" role="status" /> 
              </div> */}
            </>
          )}
        </div>
    );
};

export default TrendingCourses;
