import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

const DeleteBookmarkModal = (props) => {


  return (
    <Modal
      {...props}
      size={"sm"}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    //   className="reviewModal"
    >
        <div className="BookmarkModal">
            <h4 className="mb-2 ">Delete Bookmark</h4>
            <p className="modal-time">Are you sure, You want to delete the Bookmark ?</p>
            <div className="modal-actions mt-4">
                <button className="cancelAddBookmark" onClick={props.onHide}>Cancel</button>
                <button className="submitAddBookmark modal-submit" onClick={() => props.ConfirmDelete(props.bookmarkId)}>Delete</button>
            </div>
        </div>
    </Modal>
  )
}

export default DeleteBookmarkModal