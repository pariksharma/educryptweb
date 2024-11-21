import axiosClient from "./axios";


// Version

const VersionUrl = 'version/';
export const getVersionService = async (params) => await axiosClient.post(VersionUrl + 'get_version', params)

// Master hit
const MasterUrl = 'master_hit/';
export const getAppDetial = async (params) => await axiosClient.post(MasterUrl + 'get_app_details', params);
export const getCourse_Catergory_Service = async (params) => await axiosClient.post(MasterUrl + 'content', params);
export const getTestimonialService = async (params) => await axiosClient.post(MasterUrl + 'get_testimonial_list', params)
export const stateListService = async (params) => await axiosClient.post(MasterUrl + 'get_states', params);
export const districtListService = async (params) => await axiosClient.post(MasterUrl + 'get_cities', params);
export const getBlogListService = async (params) => await axiosClient.post(MasterUrl + 'get_blog_list', params);
export const getBlogDetailService = async (id, params) => await axiosClient.post(MasterUrl + 'get_blog_detail/' + id, params)
export const InquiryService = async (params) => await axiosClient.post(MasterUrl + 'save_contact_us', params);
export const aboutUsService = async (params) => await axiosClient.post(MasterUrl + 'about', params);
export const InquiryListService = async (params) => await axiosClient.post(MasterUrl + 'get_contact_list', params);
export const InquiryReplyListService = async (params) => await axiosClient.post(MasterUrl + 'get_contact_reply_list', params)
export const InquiryReplyService = async (params) => await axiosClient.post(MasterUrl + 'save_contact_us_reply', params)
export const contactUsService = async (params) => await axiosClient.post(MasterUrl + 'contact', params);
export const faqService = async (params) => await axiosClient.post(MasterUrl + 'get_app_faq', params);
export const policyService = async (params) => await axiosClient.post(MasterUrl + 'policies', params);
export const termService = async (params) => await axiosClient.post(MasterUrl + 'terms', params);
export const refundService = async (params) => await axiosClient.post(MasterUrl + 'refund', params);
export const footerService = async (params) => await axiosClient.post(MasterUrl + 'footer', params);

// Courses

const CourseUrl = 'course/';
export const getCourse_service = async (params) => await axiosClient.post(CourseUrl + 'get_courses', params)
export const getCourseDetail_Service = async (params) => await axiosClient.post('course_deprecated/get_course_detail' ,params)
export const getMasterDataService = async (params) => await axiosClient.post(CourseUrl + 'get_master_data', params)
export const getMyCourseService = async (params) => await axiosClient.post(CourseUrl + 'get_my_courses', params)
export const getMyOrderService = async (params) => await axiosClient.post(CourseUrl + 'get_my_orders', params);
export const getCourseReviewService = async (params) => await axiosClient.post(CourseUrl + 'course_review_list', params);
export const postCourseReviewService = async (params) => await axiosClient.post(CourseUrl + 'post_course_review', params);
export const getLiveCourseService = async (params) => await axiosClient.post(CourseUrl + 'get_live_videos', params);
export const getLiveTestService = async (params) => await axiosClient.post(CourseUrl + 'get_live_tests', params);


// Coupons

const CouponUrl = 'coupon/';
export const getCoupon_service = async (params) => await axiosClient.post(CouponUrl + 'get_coupon_over_course' , params)
export const couponVerifyService = async (params) => await axiosClient.post(CouponUrl + 'coupon_verification', params)

// Current Affairs

const currentAffairUrl = 'current_affairs/';
export const getCurrentAffair_service = async (params) => await axiosClient.post(currentAffairUrl + 'current_affair_list', params)
export const getCurrentAffairDetails = async (params) => await axiosClient.post(currentAffairUrl + 'current_affair_get_details', params)

// Faculties

const facultyUrl = 'educators/';
export const getFaculty_Service = async (params) => await axiosClient.post(facultyUrl + 'get_educators', params)


// Login

const AuthUrl = "users/";
export const userLoginService = async (params) => await axiosClient.post(AuthUrl + 'login_auth', params)
export const sendVerificationOtpService = async (params) => await axiosClient.post(AuthUrl + 'send_verification_otp', params)
export const userRegisterService = async (params) => await axiosClient.post(AuthUrl + 'registration', params)
export const userLogoutService = async (params) => await axiosClient.post(AuthUrl + 'logout', params)
export const updatePasswordService = async (params) => await axiosClient.post(AuthUrl + 'update_password', params)
export const getMyProfileService = async (params) => await axiosClient.post(AuthUrl + 'get_my_profile', params)
export const userUpdateProfileService = async (params) => await axiosClient.post(AuthUrl + 'update_profile', params)

// Notification

const NotificationUrl = "notification/"
export const getNotificationService = async (params) => await axiosClient.post(NotificationUrl + 'get_notifications', params)
export const markReadNotification = async (params) => await axiosClient.post(NotificationUrl + 'mark_as_read', params);

// Payment

const PaymentUrl = 'payment/';
export const getPayGatewayService = async (params) => await axiosClient.post('master_hit/get_pay_gateway', params);
export const getFPaymentService = async (params) => await axiosClient.post(PaymentUrl + 'f_payment', params);
export const freeTransactionService = async (params) => await axiosClient.post(PaymentUrl + 'free_transaction', params);
export const pendingInstallmentService = async (params) => await axiosClient.post(PaymentUrl + 'pending_installment', params);
export const saveAddressService = async (params) => await axiosClient.post(PaymentUrl + 'save_user_address', params);
export const getUserAddressService = async (params) => await axiosClient.post(PaymentUrl + 'get_user_address', params)
export const deleteAddressService = async (params) => await axiosClient.post(PaymentUrl + 'delete_user_address', params);


// Posts

const PostUrl = 'post/';
export const getPostListService = async (params) => await axiosClient.post(PostUrl + 'get_post_list', params);
export const likeUnlikePostService = async (params) => await axiosClient.post(PostUrl + 'like_unlike_post', params)
export const addCommentService = async (params) => await axiosClient.post(PostUrl + 'comment_post', params)
export const feedCommentListService = async (params) => await axiosClient.post(PostUrl + 'get_feed_comments', params)


// Live

const PollUrl = 'poll/';
export const getContentMeta = async (params) => await axiosClient.post(PollUrl + '/get_content_meta', params)