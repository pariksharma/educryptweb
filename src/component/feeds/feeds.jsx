import { addCommentService, feedCommentListService, getPostListService, likeUnlikePostService } from '@/services';
import { decrypt, encrypt, get_token, userLoggedIn } from '@/utils/helpers';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react'
// import toast, { Toaster } from 'react-hot-toast'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegComment } from "react-icons/fa";
import { PiShareFatBold } from "react-icons/pi";
import { format } from "date-fns";
import ErrorPage from '../errorPage';
import Button1 from '../buttons/button1/button1';
import ErrorPageAfterLogin from '../errorPageAfterLogin';
import LoaderAfterLogin from '../loaderAfterLogin';
import Head from 'next/head';

const Feeds = () => {

  const [postList, setPostList] = useState([]);
  const [feedCommentList, setFeedCommentList] = useState({
    chk: '',
    postId: '',
    data: [],
  })
  const [feedReplyCommentList, setFeedReplyCommentList] = useState({
    chk: '',
    postId: '',
    data: [],
  })
  const [showError, setShowError] = useState(false);
  const [isToasterOpen, setIsToasterOpen] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(0);
  const [showReplyComment, setShowReplyComment] = useState(0);
  const [userId, setUserId] = useState('');
  const [addComment, setAddComment] = useState('');
  const [replyComment, setReplyComment] = useState('')
  const router = useRouter()
  const token = get_token();
  const commentDivRef = useRef(null);
  const replyCommentRef = useRef(null);

  useEffect(() => {
    setShowError(false)
    setShowCommentInput(0)
    setShowReplyComment(0)
    setReplyComment('');
    fetchPostList();
    setUserId(userLoggedIn())
    setFeedCommentList({
      chk: '',
      postId: '',
      data: [],
    })
    setFeedReplyCommentList({
      chk: '',
      postId: '',
      data: [],
    })
    const handleClickOutside = (event) => {
      if (commentDivRef.current && !commentDivRef.current.contains(event.target)) {
        setShowCommentInput(0);
        setShowReplyComment(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [])

  useEffect(() => {
    const handleClickOutside2 = (event) => {
      if (replyCommentRef.current && !replyCommentRef.current.contains(event.target)) {
        setShowReplyComment(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside2);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside2);
    };
  }, [])

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    if (isToasterOpen) {
      setTimeout(() => {
        setIsToasterOpen(false)
      }, 1500)
    }
  }, [isToasterOpen])

  useEffect(() => {
    setAddComment('')
  }, [showCommentInput])

  const showErrorToast = (toastMsg) => {
    if (!isToasterOpen) {
      setIsToasterOpen(true);
      toast.error(toastMsg, {
        // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
        autoClose: 1500
      });
    }
  }

  const showSuccessToast = (toastMsg) => {
    if (!isToasterOpen) {
      setIsToasterOpen(true);
      toast.success(toastMsg, {
        // onClose: () => setIsToasterOpen(false),  // Set isToasterOpen to false when the toaster closes
        autoClose: 1500
      });
    }
  }

  const fetchPostList = async () => {
    try {
      const formData = {
        main_cat: 20,
        // master_cat:2108,
        page: 1,
        // post_type:0,
        sub_cat: 0,
        // type:1,
        // temp:2,
      };
      const response_getPostList_service = await getPostListService(encrypt(JSON.stringify(formData), token));
      const response_getPostList_data = decrypt(response_getPostList_service.data, token);
      // console.log('response_getPostList_data', response_getPostList_data)
      if (response_getPostList_data?.status) {
        if (response_getPostList_data?.data?.posts?.length == 0) {
          setShowError(true)
        }
        else setPostList(response_getPostList_data?.data?.posts)
      }
      else {
        if (response_getPostList_data.message === msg) {
          toast.error(response_getPostList_data.message);
          localStorage.removeItem("jwt");
          localStorage.removeItem("user_id");
          if (router.pathname.startsWith("/private")) {
            router.push("/");
            setShowError(true)
          } else {
            location.reload();
            setShowError(false);
          }
        }
      }
    } catch (error) {
      console.log("error found: ", error)
    }
  }

  const formatDate = (value) => {
    const cr_date = new Date(value * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      return (format(cr_date, "EEE d MMMM, yyyy | h:mm a"));
    }
  }

  const isError = (id) => {
    if (id) {
      if (replyComment) {
        return true
      }
      else false
    }
    else {
      if (addComment) {
        return true
      }
      else false
    }
  }

  const formatCommentDate = (value) => {
    const cr_date = new Date(value * 1000);
    if (cr_date) {
      // setDate(cr_date.toString().substring(0, cr_date.toString().indexOf('GMT')))
      return (format(cr_date, "d MMMM, yyyy"));
    }
  }

  const handleLikePost = async (postId, like) => {
    try {
      const formData = {
        post_id: postId,
        my_like: like
      }
      // console.log('formData', formData)
      const response_likeUnlike_service = await likeUnlikePostService(encrypt(JSON.stringify(formData), token));
      const response_likeUnlike_data = decrypt(response_likeUnlike_service.data, token)
      // console.log('response_likeUnlike_data', response_likeUnlike_data)
      if (response_likeUnlike_data.status) {
        fetchPostList()
      }
    } catch (error) {
      // console.log("error found: ", error)
    }
  }

  const handleAddComment = async (parentId, postId, index) => {
    try {
      if (isError(parentId)) {
        const formData = {
          post_id: postId,
          comment: parentId ? replyComment : addComment,
          parent_id: parentId ? parentId : ''
        }
        const response_addComment_service = await addCommentService(encrypt(JSON.stringify(formData), token))
        const response_addComment_data = decrypt(response_addComment_service.data, token)
        if (response_addComment_data.status) {
          // setShowCommentInput(0);
          showSuccessToast("Comment Posted");
          setAddComment('')
          setReplyComment('');
          parentId ? handleShowReplyComment(postId, index, parentId) : handleShowComment(postId, index)
        }
        // console.log('response_addComment_data', response_addComment_data)
      }
      else {
        showErrorToast("Please enter your comment")
      }
    } catch (error) {
      console.log("error found: ", error)
    }
  }

  const handleShowComment = async (postId, index) => {
    try {
      setShowCommentInput(index + 1);
      const cmntList = await commentList(0, postId)
      if (cmntList?.length > 0) {
        setFeedCommentList({
          postId,
          data: cmntList,
        })
      }
    } catch (error) {
      console.log("error found: ", error)
    }
  }

  const handleShowReplyComment = async (postId, index, parentId) => {
    try {
      setShowReplyComment(index + 1);
      const cmntList = await commentList(parentId, postId);
      if (cmntList?.length > 0) {
        if (!parentId) {
          setFeedCommentList({
            chk: index,
            postId,
            data: cmntList,
          })
        }
        else {
          setFeedReplyCommentList({
            chk: index + 1,
            postId,
            data: cmntList
          })
        }
      }
    } catch (error) {
      console.log("error found: ", error)
    }
  }

  const commentList = async (parentId, postId) => {
    try {
      const formData = {
        parent_id: parentId ? parentId : 0,
        post_id: postId
      }
      const response_commentList_service = await feedCommentListService(encrypt(JSON.stringify(formData), token));
      const response_commentList_data = decrypt(response_commentList_service.data, token);
      if (response_commentList_data.status) {
        return response_commentList_data.data
      }
      else {
        if (!formData.parent_id) {
          setFeedCommentList({
            postId,
            data: [],
          })
        }
        else {
          setFeedReplyCommentList({
            postId,
            data: []
          })
        }
      }
      // console.log('response_commentList_data', response_commentList_data)
    } catch (error) {
      console.log("error found: ", error)
      router.push('/')
    }
  }

  return (
    <>
      <Head>
        <title>{'Feeds'}</title>
        <meta name={'Feeds'} content={'Feeds'} />
      </Head>

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {
        postList.length > 0 ?
          postList.map((item, index) => {
            return <div className="mx-auto card feedCard mb-2" key={index}>
              <div className="card_header gap-2 d-flex align-items-center">
                <img className="feedImg" src={
                  item?.profile_picture
                    ? item?.profile_picture
                    : "https://dummyimage.com/250x150/9966cc/fff"
                } alt='' />
                <div className="">
                  <h4 className="m-0 feedUserTitle">{item && item?.name}</h4>
                  <p className="m-0 schedule_date">{item && formatDate(item?.schedule_date)}</p>
                </div>
              </div>
              <hr />
              <div className="card_body feedText">
                <p className='m-0' dangerouslySetInnerHTML={{ __html: item && item.description }} />
                {item.post_type == 1 &&
                  <div dangerouslySetInnerHTML={{ __html: item && item.meta_url }} />
                }
                {
                  item.post_type == 2 &&
                  <img className="mt-2 f_Img" src={item && item?.meta_url} alt='' />
                }
                {
                  item.post_type == 3 &&
                  <video controls>
                    <source src={item?.meta_url} type="video/mp4"></source>
                  </video>
                }
                {
                  item.post_type == 4 &&
                  <audio controls>
                    <source src={item?.meta_url} type="audio/mpeg"></source>
                  </audio>
                }
                {
                  item.post_type == 5 &&
                  <a href={item && item?.meta_url} />
                }
                {
                  item.post_type == 6 &&
                  <div dangerouslySetInnerHTML={{ __html: item && item.meta_url }} />
                }
              </div>
              <hr />
              <div className="card_footer d-flex justify-content-between align-items-center">
                <p className="m-0 gap-1 d-flex align-items-center">
                  {item.my_like == 0 ?
                    <i className="bi bi-heart" onClick={() => handleLikePost(item.id, 1)}></i>
                    :
                    <i className="bi bi-suit-heart-fill" onClick={() => handleLikePost(item.id, 0)}></i>
                  }
                  <span>Like {item && item?.total_likes}</span>
                </p>
                <p className="m-0 gap-1 d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => handleShowComment(item.id, index)}>
                  <i className="bi bi-chat"></i>
                  <span>Comment {item && item?.total_comments}</span>
                </p>
                <p className="m-0 gap-1 d-flex align-items-center">
                  <PiShareFatBold />
                  <span> 0 </span>
                </p>
              </div>

              {/* ////////////////////// Add Comment  //////////////////////////// */}
              {showCommentInput == index + 1 &&
                <div ref={commentDivRef}>
                  <div
                    className="input-group flex-nowrap search"
                  // onClick={() => setIsVisible(true)}

                  >
                    <span
                      className="searchIcon d-md-block input-group-text"
                      id="basic-addon1"
                    >
                      <img
                        src="/assets/images/fileAttached.svg"
                        alt=""
                        style={{ width: "18px" }}
                      />
                    </span>
                    <input
                      type="text"
                      className="pb-1 d-md-block searchBar"
                      placeholder="Add a comment..."
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      fdprocessedid="b89v2o"
                      onChange={(e) => setAddComment(e.target.value)}
                      value={addComment}
                    // ref={inputRef}
                    />
                    <span
                      className="searchIconRight input-group-text"
                      id="basic-addon1"
                    >
                      {/* {searchInputValue && ( */}
                      <i className="bi bi-mic-fill"></i>
                      {/* )} */}
                    </span>
                    <Button1 value={"Post"} handleClick={() => handleAddComment(0, item.id, index)} />
                  </div>


                  {/* ////////////////////// show Comment list  //////////////////////////// */}


                  <ul className="p-0 list-unstyled">
                    {(feedCommentList.postId == item.id && feedCommentList.data.length > 0) &&
                      feedCommentList.data.map((val, idx) => {
                        if (val.status == 1) {
                          return <li className='row p-0 m-0' key={idx}>
                            <div className="p-0 mb-2 d-flex gap-2 align-items-center">
                              <img className='UserRateImg' src={val?.profile_picture ? val?.profile_picture : '/assets/images/UserRateImg.svg'} alt='' />
                              <div>
                                <h4 className="mb-1 userRateTitle">{val.name}</h4>
                                <div className="d-flex m-0 freeCourserate">
                                  <p className="m-0 freeCourseReview">
                                    {formatCommentDate(val.created)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className='m-0'>{val.comment}</p>
                            <div className="card_footer d-flex gap-2 align-items-center">
                              <p className="m-0 gap-1 d-flex align-items-center">
                                {item.my_like !== 0 ?
                                  <i className="bi bi-heart"
                                  // onClick={() => handleLikePost(item.id, 1)}
                                  ></i>
                                  :
                                  <i className="bi bi-suit-heart-fill"
                                  // onClick={() => handleLikePost(item.id, 0)}
                                  ></i>
                                }
                                <span>Like
                                  {/* {item && item?.total_likes} */}
                                </span>
                              </p>
                              <p className="m-0 gap-1 d-flex align-items-center" style={{ cursor: 'pointer' }}
                                onClick={() => handleShowReplyComment(item.id, idx, val.id)}
                              >
                                <i className="bi bi-chat"></i>
                                <span>Reply
                                  {/* {item && item?.total_comments} */}
                                </span>
                              </p>
                            </div>
                            {/* {console.log('reply list', showReplyComment)} */}


                            {/* ////////////////////// Reply Comment   //////////////////////////// */}


                            {showReplyComment == idx + 1 &&
                              <div ref={replyCommentRef}>
                                <div
                                  className="input-group flex-nowrap mx-4 mb-2"
                                // onClick={() => setIsVisible(true)}

                                >
                                  <span
                                    className="searchIcon d-md-block input-group-text"
                                    id="basic-addon1"
                                  >
                                    <img
                                      src="/assets/images/fileAttached.svg"
                                      alt=""
                                      style={{ width: "18px" }}
                                    />
                                  </span>
                                  <input
                                    type="text"
                                    className="pb-1 d-md-block searchBar"
                                    placeholder="Add a comment..."
                                    aria-label="Username"
                                    aria-describedby="basic-addon1"
                                    fdprocessedid="b89v2o"
                                    onChange={(e) => setReplyComment(e.target.value)}
                                    value={replyComment}
                                  // ref={inputRef}
                                  />
                                  <span
                                    className="searchIconRight input-group-text"
                                    id="basic-addon1"
                                  >
                                    <i className="bi bi-mic-fill"></i>
                                  </span>
                                  <Button1 value={"Post"}
                                    handleClick={() => handleAddComment(val.id, item.id, idx)}
                                  />
                                </div>


                                {/* ////////////////////// Reply Comment list  //////////////////////////// */}


                                <ul className=' mb-2'>
                                  {/* {console.log('feedReplyCommentList', (feedReplyCommentList.chk == val.id ), feedReplyCommentList.chk, val.id)} */}
                                  {(feedReplyCommentList.chk == val.id && feedReplyCommentList.data?.length > 0) &&
                                    feedReplyCommentList.data.map((rply, ind) => {
                                      if (rply.status == 1) {
                                        return <li className='row p-0 m-0' key={ind}>
                                          <div className="p-0 mb-2 d-flex gap-2 align-items-center">
                                            <img className='UserRateImg' src={rply?.profile_picture ? rply?.profile_picture : '/assets/images/UserRateImg.svg'} alt='' />
                                            <div>
                                              <h4 className="mb-1 userRateTitle">{rply.name}</h4>
                                              <div className="d-flex m-0 freeCourserate">
                                                <p className="m-0 freeCourseReview">
                                                  {formatCommentDate(rply.created)}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <p className='m-0'>{rply.comment}</p>
                                        </li>
                                      }
                                    })
                                  }
                                </ul>
                              </div>
                            }
                          </li>
                        }
                      })
                    }
                  </ul>
                </div>
              }
            </div>
          })
          :
          <>
            {showError ?
              <ErrorPageAfterLogin />
              :
              <LoaderAfterLogin />
            }
          </>
      }
    </>
  )
}

const msg = "You are already logged in with some other devices, So you are logged out from this device. 9";

export default Feeds