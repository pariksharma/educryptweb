import { getCourse_service } from "@/services";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

const SearchCourses = ({catId, handleFilterCourses}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchCourseList, setSearchCourseList] = useState([]);

  const inputRef = useRef();
  const searchRef = useRef();
  const router = useRouter();

  // console.log(catId)

  useEffect(() => {
    // console.log(searchInputValue, catId);
    let timer = setTimeout(() => {
      fetchSearchCourse(searchInputValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [catId, searchInputValue]);

  const handleSearchCourseDetail = (value) => {
    router.push(
      `/view-courses/details/${
        "" + ":" + value.id + "&" + value.combo_course_ids+'parent:'
      }`
    );
  };

  useEffect(() => {
    setSearchInputValue('')
  }, [catId])

  useEffect(() =>{
    // console.log('hell', searchCourseList)
    if(searchCourseList?.length > 0 && searchInputValue !== "") {
      handleFilterCourses(searchCourseList, searchInputValue)
    }
    else{
      // console.log('sfsf')
      handleFilterCourses([], searchInputValue)
    }
  }, [searchCourseList, searchInputValue])

  const handleRemoveSearch = () => {
    setSearchInputValue("");
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input when the button is clicked
    }
  };

  const fetchSearchCourse = async (value) => {
    try{
      const token = get_token();
      if (value) {
        const formData = {
          page: 1,
          search: value,
          main_cat: 0,
          sub_cat: 1,
          course_type: catId,
        };
        const response_getCourses_service = await getCourse_service(
          encrypt(JSON.stringify(formData), token)
        );
        const response_getCourses_data = decrypt(
          response_getCourses_service.data,
          token
        );
        if (response_getCourses_data.status) {
          setSearchCourseList(response_getCourses_data.data);
        } else {
          setSearchCourseList([]);
        }
        // console.log("response_getCourses_data", response_getCourses_data);
      }
    } catch (error) {
      console.log("error found: ", error)
      // router.push('/')
    }
  };

  return (
    <section className="container-fluid">
      <div className="row">
        <div className="col-md-12 mb-4">
          <div
            className="input-group flex-nowrap search"
            onClick={() => setIsVisible(true)}
          >
            <span
              className="searchIcon d-md-block input-group-text"
              id="basic-addon1"
            >
              <img
                src="/assets/images/profile_Search.svg"
                alt=""
                style={{ width: "12px" }}
              />
            </span>
            <input
              type="text"
              className="d-md-block searchBar"
              placeholder="Search..."
              aria-label="Username"
              aria-describedby="basic-addon1"
              onChange={(e) => setSearchInputValue(e.target.value)}
              value={searchInputValue}
              ref={inputRef}
            />
            <span
              className="searchIconRight input-group-text"
              id="basic-addon1"
            >
              {searchInputValue && (
                <img
                  src="/assets/images/searchRemove.svg"
                  alt=""
                  style={{ width: "12px" }}
                  onClick={handleRemoveSearch}
                />
              )}
            </span>
            {/* {isVisible && searchInputValue && (
              <ul
                ref={searchRef}
                className="px-2 py-3 w-100 list-unstyled searchDropDown"
              >
                {searchCourseList.length > 0 ? (
                  searchCourseList.map((item, index) => {
                    return (
                      <li
                        className="mb-2 d-flex align-items-center"
                        key={index}
                      >
                        <img
                          className="listImg"
                          src={item.cover_image && item.cover_image}
                          alt=""
                        />
                        <p className="m-0 list_Title">{item.title}</p>
                        <img
                          src="/assets/images/redirectLogo.png"
                          alt=""
                          onClick={() => handleSearchCourseDetail(item)}
                        />
                        <div className="clearfix"></div>
                      </li>
                    );
                  })
                ) : (
                  <>
                    <p>No Course Found</p>
                  </>
                )}
              </ul>
            )} */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchCourses;
