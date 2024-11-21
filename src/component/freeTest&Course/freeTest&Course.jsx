import React, { useState, useEffect } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import FreeContent from './freeContent';
// import { freeTestAry } from '../../../public/assets/sampleArry';
import { useSelector } from 'react-redux';
import { isValidData } from '@/utils/helpers';

const Free_Test_Course = () => {
  const [key, setKey] = useState('course');
  const [isLoading, setIsLoading] = useState(false)
  const CourseData = useSelector((state) => state.allCategory.allCourse);
  const freeCourseAry = isValidData(CourseData) && CourseData?.filter((item) => item.mrp == 0 && item.cat_type == 0)
  const freeTestAry = isValidData(CourseData) && CourseData?.filter((item) => item.mrp == 0 && item.cat_type == 9)
  // console.log('freeCourseAry', CourseData)


  return (
    <>
      <div className="container freeTC_container">
        {freeTestAry || freeCourseAry ? (
          <div className="heading_tab">
            <Tabs
              id="controlled-tab-example1"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-2 d-flex justify-content-center"
            >
              {freeCourseAry?.length > 0 &&
              <Tab eventKey="course" title="Free Courses">
                {isValidData(freeCourseAry) ? (
                  <FreeContent value={freeCourseAry} titleName={"course"} />
                ) : (
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status" />
                  </div>
                )}
              </Tab>
              }    
              {freeTestAry?.length > 0 &&
              <Tab eventKey="test" title="Free Test Series">
                {isValidData(freeTestAry) ? (
                  <FreeContent value={freeTestAry} titleName={"test"} />
                ) : (
                  <div className="d-flex justify-content-center">
                    <div
                      className="spinner-border d-flex justify-content-center"
                      role="status"
                    />
                  </div>
                )}
              </Tab>
              }
            </Tabs>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default Free_Test_Course;
