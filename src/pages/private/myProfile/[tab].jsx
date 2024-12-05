import Blogs from "@/component/blogs/blogs";
import Bookstore from "@/component/bookstore/bookstore";
import CurrentAffairList from "@/component/currentAffairList/currentAffairList";
import Feeds from "@/component/feeds/feeds";
import Header from "@/component/header/header";
import Inquiry from "@/component/inquiry/inquiry";
import LiveClass from "@/component/liveClass/liveClass";
import LiveTest from "@/component/liveTest/liveTest";
import LoaderAfterLogin from "@/component/loaderAfterLogin";
import MyCourse from "@/component/myCourse/myCourse";
import Notification from "@/component/notification/notification";
import OurCourses from "@/component/ourCourses/ourCourses";
import Profile from "@/component/profile/profile";
import PurchaseHistory from "@/component/purchaseHistory/purchaseHistory";
import SideBar from "@/component/sideBar/sideBar";
import Testimonial from "@/component/testimonial/testimonial";
import { useRouter } from "next/router";
import { decrypt, get_token, userLoggedIn } from "@/utils/helpers";
import React, { useEffect, useState } from "react";

const Index = ({ initialTab }) => {
  const router = useRouter();
  const [statusTab, setStatusTab] = useState(initialTab);
  const [title, settitle] = useState('');
  useEffect(() => {
    // Update statusTab whenever the router.query.tab changes
    const { tab,title } = router.query;
    if (tab) {
      setStatusTab(tab);
    }
    settitle(title)
  }, [router.query]); // Dependency array with router.query.tab

  useEffect(() => {
    const currentPath = router.asPath;
    localStorage.setItem("redirectdetails", currentPath);
    const isLoggedIn = userLoggedIn()
    if(router.pathname.startsWith("/private") && !isLoggedIn){
      router.push('/')
    }
  }, [router])
  useEffect(() => {
    // Function to apply overflow style based on viewport size
    const updateOverflowStyle = () => {
      const currentPath = window.location.pathname; // Get only the pathname, no query strings
      const viewportWidth = window.innerWidth;

      // Check if the URL matches the desired page
      if (currentPath.includes("/private/myProfile/play/")) {
        // Apply overflow: hidden for smaller devices (<= 1024px)
        if (viewportWidth >= 1024) {
          document.documentElement.style.overflow = "hidden";
        } else {
          document.documentElement.style.overflow = "auto"; // Remove overflow: hidden for larger devices
        }
      } else {
        document.documentElement.style.overflow = "auto"; // Reset for other pages
      }
    };

    // Apply the overflow style on mount
    updateOverflowStyle();

    // Listen for window resize events to update the overflow style dynamically
    window.addEventListener("resize", updateOverflowStyle);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", updateOverflowStyle);
    };
  }, []);

  // console.log('statusTab', statusTab)

  const renderContent = () => {
    switch (statusTab) {
      case "10":
        return <Feeds />;
      case "ourCourse":
        return <OurCourses />;
      case "live_Test":
        return <LiveTest />;
      case "live_Classes":
      case "8":
        return <LiveTest title={title} />;
      case "9":
        return <LiveClass title={title}/>;
      case "29":
        return <Blogs title={title} />;
      case "current_affairs":
      case "17":
        return <CurrentAffairList title={title}/>;
      case "testimonial":
        return <Testimonial />;
      case "bookstore":
      case "14":
        return <Bookstore  title={title}/>;
      case "notification":
        return <Notification />;
      case "myCourse":
        return <MyCourse />;
      case "purchase-history":
        return <PurchaseHistory />;
      case "31":
      case "12":
        return <Inquiry title={title} />;
      case "profile":
        return <Profile />;
      default:
        return <LoaderAfterLogin />;
    }
  };

  return (
    <>
      <Header />
      <div className="d-flex" style={{ marginTop: "55px" }}>
        <SideBar />
        <main className="main_content flex-grow-1">
          {renderContent()}
        </main>
      </div>
    </>
  );
};

// // Use `getStaticPaths` to define available dynamic routes
// Use `getStaticPaths` to define available dynamic routes
export const getStaticPaths = async () => {
  const paths = [
    { params: { tab: "10" } },
    { params: { tab: "ourCourse" } },
    { params: { tab: "live_Test" } },
    { params: { tab: "live_Classes" } },
    { params: { tab: "blog" } },
    { params: { tab: "28" } },
    { params: { tab: "current_affairs" } },
    { params: { tab: "testimonial" } },
    { params: { tab: "bookstore" } },
    { params: { tab: "notification" } },
    { params: { tab: "myCourse" } },
    { params: { tab: "purchase-history" } },
    { params: { tab: "31" } },
    { params: { tab: "8" } },
    { params: { tab: "9" } },
    { params: { tab: "Blog" } },
    { params: { tab: "29" } },
    { params: { tab: "17" } },
    { params: { tab: "Testimonial" } },
    { params: { tab: "14" } },
    { params: { tab: "myCourse" } },
    { params: { tab: "purchase-history" } },
    { params: { tab: "12" } },
    { params: { tab: "profile" } },
  ];

  return { paths, fallback: false };
};

// Use `getStaticProps` to provide data at build time
export const getStaticProps = async ({ params }) => {
  const { tab } = params;

  return {
    props: {
      initialTab: tab || null, // Provide initialTab as a prop
    },
  };
};

export default Index;
