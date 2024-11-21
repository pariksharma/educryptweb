import axios from "axios";

let appIdStore = null; // Global variable to hold appId temporarily

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const fetchAppId = async () => {
    if (appIdStore || (typeof window !== "undefined" && localStorage.getItem('appId'))) {
        // If appId is already fetched, use the stored one
        return appIdStore || localStorage.getItem('appId');
    }

    try {
        const token = typeof window !== "undefined" ? localStorage.getItem('jwt') : "";
        //  const formData = { domain: "https://educryptnetlify.videocrypt.in" };    //dev data
      const formData = { domain: "https://lab.live" };   // lab data
      // const formData = { domain: "https://nexttoppers.com/" };   // Next Topper data
        const response_content_service = await getAppDetial(encrypt(JSON.stringify(formData), token));
        const app_detail_data = decrypt(response_content_service.data, token);

        if (app_detail_data.status) {
            const appId = app_detail_data.data.id;
            appIdStore = appId; // Store in variable for current session
            if (typeof window !== "undefined") {
                localStorage.setItem('appId', appId); // Persist in localStorage for future sessions
            }
            return appId;
        } else {
            // Handle case where app details are not fetched successfully
            console.error("Failed to fetch appId");
            return null;
        }
    } catch (error) {
        console.error("Error fetching app details:", error);
        return null;
    }
};

// Axios request interceptor to add dynamic headers
axiosClient.interceptors.request.use(async (req) => {
    const jwt = typeof window !== "undefined" ? localStorage.getItem('jwt') : "";
    const user_id = typeof window !== "undefined" ? localStorage.getItem('user_id') : "";
    const app_id = await fetchAppId();  // Ensure appId is fetched before request

    const headers = {
        'Jwt': jwt ? jwt : "jwt",
        'Userid': user_id ? user_id : 0,
        'Devicetype': 4,
        'Version': 1,
        'Lang': 1,
        'Content-Type': 'application/json',
        "Authorization": "Bearer 01*#NerglnwwebOI)30@I*Dm'@@",
        "Appid": app_id || '', // Use the fetched or stored appId
        // "User-Agent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    };

    if (typeof window === "undefined") {
        headers["User-Agent"] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
    }

    req.headers = { ...req.headers, ...headers };  // Merge headers with existing headers

    return req;
}, (error) => Promise.reject(error));

export default axiosClient;