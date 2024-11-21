import React from 'react'
import { useRouter } from 'next/router';
import Footer from '@/component/footer/footer';
import Header from '@/component/header/header';
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const ViewPdf = () => {

  const router = useRouter();
  const { viewPdf } = router.query;
  const newPlugin = defaultLayoutPlugin();

  // console.log(decodeURIComponent(viewPdf))
  return (
    <>
      <Header />
      <div className="container-fluid mt-5 mb-4">
        <div className="row">
          <div className="col-md-12 px-0 mt-1" style={{ paddingTop: "10px" }}>
            <nav aria-label="breadcrumb ">
              <ol className="breadcrumb mb-0 cursor">
                <li
                  className="breadcrumb-item"
                  onClick={() => router.back("")}
                >
                  <i className="bi bi-chevron-left"></i>
                  {`Back`}
                </li>
              </ol>
            </nav>
          </div>
          <div className='col-md-12 px-0 mt-1'>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                  fileUrl={decodeURIComponent(viewPdf)}
                  plugins={[newPlugin]}
              />
            </Worker>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ViewPdf