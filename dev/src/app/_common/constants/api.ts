export class ApiConstants {
  public static siteTitle: string = "Viztors Checkin";

  //for local
  public static webURL: string = "http://127.0.0.1:4000";
  public static baseURL: string = "http://127.0.0.1:4000/api";
  public static apiURL: string = "http://127.0.0.1:4000/api"; //dont use this
  public static faceURL: string = "http://127.0.0.1:4000/api/v1";


  //for production
  // public static webURL: string = "https://app.viztors.com";
  // public static baseURL: string = "https://app.viztors.com/api";
  // public static apiURL: string = "https://app.viztors.com/api"; //dont use this
  // public static faceURL: string = "https://app.viztors.com";

  public static messageWebURL: string = "https://app.viztors.com/checkin";

  public static apiVersion: string = "v1";

  //default collection name
  public static defaultCollectionName: string = "technexa";

  //static company id
  // public static companyId: string = "5e94c327d26fcb3838679066";
  // public static companyDetail: string = "companies/detail";

  //users
  public static userLogin: string = "authentication/login";
  public static userRegister: string = "users/register";
  public static userProfile: string = "users/profile";
  public static userDelete: string = "users/delete";
  public static users: string = "users";

  //otp
  public static otpSend: string = "otp/send";
  public static otpVerify: string = "otp/verify";
  public static oldVisitor: string = "otp/oldvisitor";
  public static tinyUrl: string = "otp/tinyurl";

  //face
  public static faceAdd: string = "face/add";
  public static faceRecognize: string = "face/recognize";

  //employees
  public static employees: string = "employees";
  public static employeesForVisitors: string = "employees/visitor";

  //visitors
  public static visitorProfile: string = "visitors/detail";
  public static visitorDetailByid: string = "visitors/detail/byid";
  public static visitorDetailByFaceData: string = "visitors/face";
  public static visitorProfileById: string = "visitors/profile";
  public static visitorApproveById: string = "visitors/approve";
  public static visitors: string = "visitors/save";
  public static visitorPreApprovedCheckin: string = "visitors/preapproved/checkin";
  public static visitorSignout: string = "visitors/signout";
  public static visitorProfileAvatar: string = "visitors/avatar";
  public static visitorCheckedin: string = "visitors/checkedin";
  public static visitorCheckedout: string = "visitors/checkedout";

  //visitor categories
  public static visitorCategories: string = "visitorcategories";
  public static visitorCategory: string = "visitorcategories/profile";
  public static visitorCategoryDelete: string = "visitorcategories/delete";

  //ngx-dropdown config
  public static config: Object = {
    displayKey: "", //if objects array passed which key to be displayed defaults to description
    search: true, //true/false for the search functionlity defaults to false,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    // height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
    placeholder: '', // text to be displayed when no item is selected defaults to Select,
    // customComparator: () => { }, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
    // moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    // noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    // searchPlaceholder: 'Search', // label thats displayed in search input,
    // searchOnKey: 'name', // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
    // clearOnSelection: false // clears search criteria when an option is selected if set to true, default is false
  }

}
