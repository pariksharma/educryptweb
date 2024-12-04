import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

const BookmarkModal = (props) => {

    const [bookmarkTitle, setBookmarkTitle] = useState('')
    
    const formatTime = (timeString) => {
      const timeParts = timeString.split(':');
      const formattedParts = timeParts.map(part => part.padStart(2, '0'));
      return formattedParts.join(':');
    }

  return (
    <Modal
      {...props}
      size={"sm"}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    //   className="reviewModal"
    >
        <div className="BookmarkModal">
            {/* <h4 className="m-0 ">Add Bookmark</h4> */}
            <p className="modal-time">Time : {formatTime(props.time)}</p>
            <input 
                type="text" 
                placeholder="Enter Title"
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                 className="modal-input"
            />
            <div className="modal-actions mt-4">
                <button className="cancelAddBookmark" onClick={props.onHide}>Cancel</button>
                <button className="submitAddBookmark modal-submit" onClick={(e) => props.submitBookmark(e, bookmarkTitle)}>Submit</button>
            </div>
        </div>
    </Modal>
  )
}

export default BookmarkModal