import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/home'
import Head from 'next/head';
const RoutePage = ({tenantName}) => {

  const [profile, setProfile] = useState({})
  const [appTitle, setAppTitle] = useState('');

//   useEffect(() => {
//     setProfile(profileMap[tenantName]);
//   }, [tenantName])

  useEffect(() => {
    setAppTitle(localStorage.getItem('title'))
  }, [])


    

  return (
    <>
            <Head>
                <title>{appTitle ? appTitle : "Home"}</title>
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