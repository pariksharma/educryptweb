// pages/testimonial.js
import React, { useState, useEffect } from 'react';
import Slider from "react-slick";
import * as Icon from "react-bootstrap-icons";
import "bootstrap-icons/font/bootstrap-icons.css";
import SliderTestimonial from '../slider/sliderTestimonial/sliderTestimonial';
import { get_token, TestScreenWidth } from '../../utils/helpers';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { encrypt, decrypt, isValidData } from '../../utils/helpers';
import { getTestimonialService } from '@/services';

const Testimonial = () => {
    const [showSlide, setShowSlide] = useState(3);
    const [isLoading, setIsLoading] = useState(false);
    const [testimonial_Ary1, settestimonial_Ary1] = useState('');
    const [length, setLength] = useState(0);
    

    useEffect(() => {
      if (typeof window !== "undefined") {
        setTimeout(() => {
            fetchTestimonialData() 
        }, 1000);
        const changeWidth = () => {
            setShowSlide(TestScreenWidth());
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

    const settings = {
        className: "center",
        centerMode: length > 3 ? true : false,
        infinite: length > 3 ? true : false,
        autoplay: true,
        dots: true,
        centerPadding: "0px",
        slidesToShow: showSlide,
        speed: 500,
        nextArrow: <Icon.ChevronRight />,
        prevArrow: <Icon.ChevronLeft />,
        responsive: [
            {
              breakpoint: 1200, // Adjust to your desired breakpoint
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
                centerMode: false,
              },
            },
            {
              breakpoint: 768, // Another breakpoint for smaller screens
              settings: {
                slidesToShow: 1, // Number of slides to show at this breakpoint
                slidesToScroll: 1,
                centerMode: false,
              },
            },
            {
              breakpoint: 480, // Breakpoint for very small screens
              settings: {
                slidesToShow: 1, // Number of slides to show at this breakpoint
                slidesToScroll: 1,
                centerMode: false,
              },
            },
          ],
    };

    const fetchTestimonialData = async () => {
      try{
        const token = get_token();
        const formData = new FormData();
        const response_testimonial_service = await getTestimonialService(formData);
        const testimonial_service_Data = decrypt(response_testimonial_service.data, token)
        if(testimonial_service_Data.status){
            // console.log('testimonal response', testimonial_service_Data.data.testimonial)
            settestimonial_Ary1(testimonial_service_Data.data.testimonial)
            setLength(testimonial_service_Data.data.testimonial.length)
        }
      } catch (error) {
        console.log("error found: ", error)
        // router.push('/')
      }
    }

    return (
      <>
        <div className='container mb-3 test_container'>
          {isValidData(testimonial_Ary1) && <>
            <div className='testimonial_heading'>
                <h1 className="main-title">Testimonials</h1>
                {/* <p>Lorem Ipsum is simply dummy text of the printing</p> */}
            </div>
            <div className='container-fluid testimonial-slider'>
                <Slider {...settings}>
                    { testimonial_Ary1.map((item, index) => {
                        return <SliderTestimonial value={item} key={index} />
                    })}
                </Slider>
            </div>
          </>}
        </div>
      </>
    );
};

export default Testimonial;
