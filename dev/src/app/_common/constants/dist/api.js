"use strict";
exports.__esModule = true;
exports.ApiConstants = void 0;
var ApiConstants = /** @class */ (function () {
    function ApiConstants() {
    }
    ApiConstants.siteTitle = "Viztors Checkin";
    //for local
    ApiConstants.webURL = "http://127.0.0.1:4000";
    ApiConstants.baseURL = "http://127.0.0.1:4000/api";
    ApiConstants.apiURL = "http://127.0.0.1:4000/api"; //dont use this
    ApiConstants.faceURL = "http://127.0.0.1:4000/api/v1";
    //for production
    // public static webURL: string = "https://app.viztors.com";
    // public static baseURL: string = "https://app.viztors.com/api";
    // public static apiURL: string = "https://app.viztors.com/api"; //dont use this
    // public static faceURL: string = "https://app.viztors.com";
    ApiConstants.messageWebURL = "https://app.viztors.com/checkin";
    ApiConstants.apiVersion = "v1";
    //default collection name
    ApiConstants.defaultCollectionName = "technexa";
    //static company id
    ApiConstants.companyId = "5e94c327d26fcb3838679066";
    ApiConstants.companyDetail = "companies/detail";
    //users
    ApiConstants.userLogin = "authentication/login";
    ApiConstants.userRegister = "users/register";
    ApiConstants.userProfile = "users/profile";
    ApiConstants.userDelete = "users/delete";
    ApiConstants.users = "users";
    //otp
    ApiConstants.otpSend = "otp/send";
    ApiConstants.otpVerify = "otp/verify";
    ApiConstants.oldVisitor = "otp/oldvisitor";
    ApiConstants.tinyUrl = "otp/tinyurl";
    //otp
    ApiConstants.faceAdd = "face/add";
    ApiConstants.faceRecognize = "face/recognize";
    //employees
    ApiConstants.employees = "employees";
    ApiConstants.employeesForVisitors = "employees/visitor";
    //visitors
    ApiConstants.visitorProfile = "visitors/detail";
    ApiConstants.visitorDetailByid = "visitors/detail/byid";
    ApiConstants.visitorDetailByFaceData = "visitors/face";
    ApiConstants.visitorProfileById = "visitors/profile";
    ApiConstants.visitorApproveById = "visitors/approve";
    ApiConstants.visitors = "visitors/save";
    ApiConstants.visitorSignout = "visitors/signout";
    ApiConstants.visitorProfileAvatar = "visitors/avatar";
    //visitor categories
    ApiConstants.visitorCategories = "visitorcategories";
    ApiConstants.visitorCategory = "visitorcategories/profile";
    ApiConstants.visitorCategoryDelete = "visitorcategories/delete";
    //ngx-dropdown config
    ApiConstants.config = {
        displayKey: "",
        search: true,
        limitTo: 10,
        // height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
        placeholder: ''
    };
    return ApiConstants;
}());
exports.ApiConstants = ApiConstants;
