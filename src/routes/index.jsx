import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/home'
import Head from 'next/head';
import { useSelector } from 'react-redux';
const RoutePage = ({tenantName}) => {

  const [profile, setProfile] = useState({})

  const appDetail = useSelector((state) => state?.appDetail?.app_detail);

//   useEffect(() => {
//     setProfile(profileMap[tenantName]);
//   }, [tenantName])



    

  return (
    <>
            <Head>
                <title>{appDetail.title ? appDetail.title : "Home"}</title>
                <meta name={"Home"} />
            </Head>
    
        {/* <Routes> */}
            {/* <Route exact path='/' element={<Home />} /> */}
        {/* </Routes> */}
        {/* {tenantName &&  */}
          <Home />
        {/* } */}
    </>
  )
// }
}

export default RoutePage