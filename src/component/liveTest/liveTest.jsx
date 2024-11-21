import React, { useState, useRef, lazy, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { decrypt, encrypt, get_token } from "@/utils/helpers";
import { getLiveTestService } from "@/services";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useRouter } from "next/router";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';

const LiveTestCard = lazy(() => import("../cards/liveTestCard"));
const ErrorPageAfterLogin = lazy(() => import("../errorPageAfterLogin"));
const LoaderAfterLogin = lazy(() => import("../loaderAfterLogin"));

const LiveTest = ({ title }) => {
  const [key, setKey] = useState("LIVE");
  const [showErrorMap, setShowErrorMap] = useState({ LIVE: false, UPCOMING: false, COMPLETED: false });
  const router = useRouter();
  const token = get_token();
  const popupRef = useRef(null);
  const intervalRef = useRef(null);

  const queryClient = useQueryClient();

  const fetchLiveTest = async (type) => {
    try {
      const formData = { page: 1, type };
      const encryptedData = encrypt(JSON.stringify(formData), token);
      const response = await getLiveTestService(encryptedData);
      const decryptedData = decrypt(response.data, token);

      if (decryptedData?.status) {
        return decryptedData?.data;
      } else {
        if (decryptedData.message === msg) {
          localStorage.removeItem("jwt");
          localStorage.removeItem("user_id");
          router.push("/");
        }
        throw new Error("No data found");
      }
    } catch (error) {
      console.error("API call error:", error);
      updateShowError(key, true); // Set error state for the current tab
      return []; // Return an empty array
    }
  };

  const { data: liveTests, isLoading } = useQuery({
    queryKey: ["liveTests", key],
    queryFn: () => fetchLiveTest(key === "LIVE" ? 0 : key === "UPCOMING" ? 1 : 2),
    cacheTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    enabled: true,
    onError: () => updateShowError(key, true),
    onSuccess: (data) => {
      if (!data || data.length === 0) {
        updateShowError(key, true);
      } else {
        updateShowError(key, false);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["liveTests", key], { refetchActive: false });
    },
  });

  const handleTabChange = (k) => {
    setKey(k);
  };

  const handleCallFunction = () => {
    queryClient.invalidateQueries(["liveTests", key]);
  };

  const updateShowError = (tabKey, errorStatus) => {
    setShowErrorMap(prevState => ({
      ...prevState,
      [tabKey]: errorStatus
    }));
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name={title} content={title} />
      </Head>

      <ToastContainer position="top-right" autoClose={1000} hideProgressBar={false} theme="light" />

      <section className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <Tabs
              defaultActiveKey="LIVE"
              id="uncontrolled-tab-example"
              className="CustomTab mb-3"
              activeKey={key}
              onSelect={handleTabChange}
            >
              {["LIVE", "UPCOMING", "COMPLETED"].map((tabKey, index) => (
                <Tab eventKey={tabKey} title={tabKey} key={index}>
                  <div className="row">
                    {isLoading ? (
                      <LoaderAfterLogin />
                    ) : showErrorMap[tabKey] ? (
                      <Suspense fallback={<LoaderAfterLogin />}>
                        <ErrorPageAfterLogin />
                      </Suspense>
                    ) : (
                      <Suspense fallback={<LoaderAfterLogin />}>
                        {liveTests?.map((item, index) => (
                          <LiveTestCard
                            key={index}
                            testData={item}
                            value={key}
                            popupRef={popupRef}
                            intervalRef={intervalRef}
                            handleCallFunction={handleCallFunction}
                          />
                        ))}
                      </Suspense>
                    )}
                  </div>
                </Tab>
              ))}
            </Tabs>
          </div>
        </div>
      </section>
    </>
  );
};

const msg = "You are already logged in with some other devices, So you are logged out from this device.";

export default LiveTest;
