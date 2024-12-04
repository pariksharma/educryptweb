import React, { useState, useEffect, forwardRef } from 'react'
import Button1 from '../buttons/button1/button1'
// import toast, { Toaster } from 'react-hot-toast';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { decrypt, encrypt, get_token } from '@/utils/helpers';
// import { getInTouchService } from '@/services';
import { useSelector } from 'react-redux';
import { InquiryService } from '@/services';

const getInTouch_image1 = '/assets/images/getInTouch.png'

const GetInTouch = forwardRef((props, ref) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isToasterOpen, setIsToasterOpen] = useState(false)
    const [gitForm, setGitForm] = useState({
        name: '',
        mobile: '',
        email: '',
        message: ''
    })

    const versionData = useSelector((state) => state.allCategory?.versionData);
    const token = get_token();

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(true)
        }, 0)
        setGitForm({
            name: '',
            mobile: '',
            email: '',
            message: ''
        })
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
            }, 2500)
        }
    }, [isToasterOpen])

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

    const handleInputMobile = (event) => {
        if (versionData.country == 0) {
            const newNumber = event.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
            if (
                !(
                    newNumber.startsWith("0") ||
                    newNumber.startsWith("1") ||
                    newNumber.startsWith("2") ||
                    newNumber.startsWith("3") ||
                    newNumber.startsWith("4") ||
                    newNumber.startsWith("5")
                ) &&
                newNumber.length < 11
            ) {
                setGitForm({
                    ...gitForm,
                    mobile: newNumber
                })
                //   setError(
                //     validateIndianNumber(newNumber) ? "" : "Invalid Indian number format"
                //   );
            }
        }
        else {
            setGitForm({
                ...gitForm,
                mobile: event.target.value
            })
        }
    }

    const validateIndianNumber = (number) => {
        // Regular expression for Indian mobile numbers starting with 6-9
        const mobileRegex = /^[6-9]\d{9}$/;

        return mobileRegex.test(number);
    };

    const validateEmail = (email) => {
        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputData = (e) => {
        const { name, value } = e.target
        if (name == 'name') {
            setGitForm({ ...gitForm, name: value.replace(/[0-9]/g, '') })
        }
        else {
            setGitForm({
                ...gitForm,
                [name]: value
            })
        }
    }

    const handleSubmit = () => {
        // console.log('hell')
        if (!gitForm.name) {
            showErrorToast("Please enter your name")
        }
        else if (!gitForm.mobile) {
            showErrorToast("Please enter your mobile number")
        }
        else if (versionData.country == 0 && !validateIndianNumber(gitForm.mobile)) {
            showErrorToast("Please enter your valid mobile number")
        }
        else if (!gitForm.email) {
            showErrorToast("Please enter your email")
        }
        else if (!validateEmail(gitForm.email)) {
            showErrorToast("Please enter your valid email")
        }
        else if (!gitForm.message) {
            showErrorToast("Please enter your message")
        }
        else {
            handleSubmitForm()
        }
    }

    const handleSubmitForm = async () => {
        try {
            const formData = {
                name: gitForm.name,
                mobile: gitForm.mobile,
                email: gitForm.email,
                message: gitForm.message,
                type: 0,
            };
            // console.log('formData', formData)
            const response_getInTouch_service = await InquiryService(encrypt(JSON.stringify(formData), token));
            const response_getInTouch_data = decrypt(response_getInTouch_service.data, token);
            if (response_getInTouch_data.status) {
                showSuccessToast(response_getInTouch_data.data);
                setGitForm({
                    name: '',
                    mobile: '',
                    email: '',
                    message: ''
                })
            }
            else {
                showErrorToast(response_getInTouch_data.data)
            }
            // console.log('response_getInTouch_data', response_getInTouch_data);
        } catch (error) {
            console.log("error found: ", error)
            // router.push('/')
        }
    }

    return (
        <>
            {/* <Toaster position="top-right" reverseOrder={false} /> */}

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
            <div className='container px-0 px-md-0 px-lg-5 mb-3 git_container' ref={ref}>
                <div className='row px-5 px-sm-0'>
                    <div className='col-md-12 col-lg-6 col-sm-12 mb-5 mb-lg-0'>
                        {/* <div className='row'> */}
                        <div className='git_heading'>
                            <h1 className='main-title'>Get In Touch</h1>
                        </div>
                        <div className="get_desc">
                            <p className="mb-2">
                                Feel free to share any queries, feedback, complaints, or concerns you have about our courses and programs. We're here to help and improve your experience!
                            </p>
                        </div>
                        <div className="getInTouchForm">
                            <input
                                name="name"
                                type="text"
                                placeholder="Name"
                                value={gitForm.name}
                                onChange={handleInputData}
                                autoComplete='off'
                            />
                            <input
                                name="mobile"
                                type="text"
                                placeholder="Mobile Number"
                                value={gitForm.mobile}
                                onChange={handleInputMobile}
                                autoComplete='off'
                            />
                            <input
                                name='email'
                                type="text"
                                placeholder="Email"
                                value={gitForm.email}
                                onChange={handleInputData}
                                autoComplete='off'
                            />
                            <textarea
                                name='message'
                                type="textarea"
                                placeholder="Enter Text message"
                                rows="5"
                                value={gitForm.message}
                                onChange={handleInputData}
                                autoComplete='off'
                                style={{resize: 'none'}}
                            />
                            <div className="sendbtn">
                                <Button1 value="Send" handleClick={handleSubmit} />
                            </div>
                        </div>
                        {/* </div> */}
                    </div>
                    <div className='col-md-12 col-lg-6 col-sm-12 d-none d-md-none d-lg-block'>
                        <div className='w-100 d-flex justify-content-center align-items-center img_container'>
                            {getInTouch_image1 && <img src={getInTouch_image1} alt='' />}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})

export default GetInTouch