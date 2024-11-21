import React, { useMemo } from "react";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import { MdModeEdit } from "react-icons/md";
import { TfiDownload } from "react-icons/tfi";

const Button1 = ({
  value,
  handleClick,
  disable,
  adClass,
  data,
  classCustom,
  widthFull,
}) => {
  // console.log("value", data);
  const defaultValue = useMemo(() => "View All Current Affair", []);
  const defaultValue1 = useMemo(() => "Edit", []);
  const defaultValue2 = useMemo(() => "Download", []);

  return (
    <>
      <button
        className={`m-0 btn userBtn ${widthFull  ? 'w-100' : ''}  ${
          classCustom ? classCustom : ""
        } text-decoration-none ${
          data ? (data === true ? "w-100" : "w-100 p-0") : ""
        } ${value?.prices?.length > 0 && "w-100"} ${adClass ? "active" : ""}`}
        onClick={handleClick}
        disabled={disable}
        style={data === data ? { padding: "0px" } : {}}
      >
        {value === defaultValue1 && <MdModeEdit className="me-1" />}
        {value} {value === defaultValue && <HiOutlineArrowNarrowRight />}
        {value == defaultValue2 && <TfiDownload />}
      </button>
    </>
  );
};

export default Button1;
