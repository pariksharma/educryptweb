import React, { useState, useCallback, lazy, Suspense } from "react";
import Carousel from "react-bootstrap/Carousel";
import { bannerAry } from "../../../public/assets/sampleArry";
import CarouselItem from "./carouselItem";
import { isValidData } from "@/utils/helpers";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

const Banner = ({ IsMargin }) => {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const bannerData = useSelector(
    (state) => state.allCategory?.allCategory?.banner_list_web
  );
  // console.log('bannerData123', bannerData)
  const courseType = useSelector(
    (state) => state.allCategory?.allCategory?.course_type_master
  );
  // console.log('courseType', courseType)

  const status = isValidData(bannerData);
  const handleSelect = useCallback((selectedIndex) => {
    setIndex(selectedIndex);
  }, []);

  const handleBannerLinks = (value) => {
    try {
      console.log(value)
      if (value.link_type == 2) {
        window.open(value.link, "_blank");
      } else if (value.link_type == 1) {
        if (router.asPath.startsWith("/private/myProfile")) {
          router.push(
            `/private/myProfile/detail/${
              "" + ":" + value.course_id + "&" + "parent:"
            }`
          );
        } else
          router.push(
            `/view-courses/details/${":" + value.course_id + "&" + "parent:"}`
          );
          
        } else if (value.link_type == 3) {
        console.log('courseType', courseType)
        console.log('value', value)
        const ary = courseType.filter((item) => item.id == value.master_cat)[0];
        router.push(`/view-courses/${ary.name + ":" + ary.id}`);
      }
    } catch (error) {
      console.log('error found: ', error)
    }
  };

  // console.log(courseType.filter(item => item.id == 27))

  return (
    <div className={`${IsMargin ? "m-0 mb-5" : " "} banner_container`}>
      <div className="row align-items-center ">
        <div
          className={`owl-carousel owl-theme owl_custom owl-loaded owl-drag `}
        >
          <Carousel
            controls={false}
            activeIndex={index}
            onSelect={handleSelect}
            className="owl-theme owl_custom owl-loaded owl-drag result p-0"
            data-bs-touch="false"
          >
            {status &&
              bannerData?.map((item, index) => (
                <Carousel.Item
                  key={index}
                  onClick={() => handleBannerLinks(item)}
                  style={{ cursor: "pointer" }}
                >
                  <CarouselItem value={item.banner_url} />
                </Carousel.Item>
              ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Banner;
