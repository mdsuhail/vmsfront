"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ProfileComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var message_1 = require("../_common/constants/message");
var api_1 = require("../_common/constants/api");
var $ = require("jquery");
var website_1 = require("@app/_common/constants/website");
var ProfileComponent = /** @class */ (function () {
    function ProfileComponent(router, route, http, formBuilder, spinnerService, toastr, employeeService, visitorService, visitorcategoriesService, faceService, otpService, _location, serializer) {
        this.router = router;
        this.route = route;
        this.http = http;
        this.formBuilder = formBuilder;
        this.spinnerService = spinnerService;
        this.toastr = toastr;
        this.employeeService = employeeService;
        this.visitorService = visitorService;
        this.visitorcategoriesService = visitorcategoriesService;
        this.faceService = faceService;
        this.otpService = otpService;
        this._location = _location;
        this.serializer = serializer;
        // latest snapshot
        this.webcamImage = null;
        this.submitted = false;
        this.visitorCategory = false;
        this.contact = false;
        this.image = false;
        this.profileImage = false;
        this.profile = false;
        this.host = false;
        this.qrcode = false;
        this.summary = false;
        this.options = [];
        this.config = api_1.ApiConstants.config;
        this.currentCompany = {};
        this.currentBranch = {};
        this.visitorDetail = {};
        this.visitorContact = '';
        this.profileImagePath = '';
        this.loaderSpinnerMessage = message_1.MessageConstants.loaderMessage;
        this.timeLeft = 8;
        this.faceData = {
            Face: {
                FaceId: '',
                ImageId: ''
            }
        };
        this.onProfile = false;
        this.onHost = false;
        this.whomToMeetSpeechText = '';
        // errorCount = { 'recognizeFace': 0, 'getEmployees': 0 };
        this.errorCount = 0;
        this.isFaceData = false;
    }
    ProfileComponent.prototype.ngOnInit = function () {
        // this.reloadOnce();
        var _this = this;
        //set dropdown menu key
        if (this.config) {
            this.config['displayKey'] = "name";
            this.config['placeholder'] = "Whom to meet";
        }
        //set form
        this.form = this.formBuilder.group({
            name: ['', [forms_1.Validators.required, forms_1.Validators.minLength(4)]],
            email: [''],
            contact: [''],
            companyFrom: [''],
            whomToMeet: ['', forms_1.Validators.required],
            isLaptop: [''],
            serialNumber: [''],
            profileImage: [''],
            profileImagePath: [''],
            signatureImagePath: [''],
            visitorCategory: [''],
            approvalStatus: [''],
            company: [''],
            companyName: [''],
            visitorVisit: ['']
        });
        this.currentCompany = JSON.parse(localStorage.getItem('company'));
        this.currentBranch = JSON.parse(localStorage.getItem('branch'));
        this.route.queryParams.subscribe(function (params) {
            var access_token = params['access_token'];
            _this.isVisitorNew = params['isVisitorNew'] ? params['isVisitorNew'] : false;
            _this.visitorContact = params['contact'] ? params['contact'] : '';
            var faceId = params['faceId'] ? params['faceId'] : '';
            var imageId = params['imageId'] ? params['imageId'] : '';
            var profileImagePath = params['profileImagePath'] ? params['profileImagePath'] : '';
            var time = params['time'] ? params['time'] : '';
            // if (access_token) {
            //   const local_access_token = localStorage.getItem('access_token')
            //   if (local_access_token !== '' || local_access_token !== undefined || local_access_token !== null)
            //     localStorage.setItem('access_token', access_token)
            // }
            if (_this.isVisitorNew) {
                if (_this.checkTime(time) == false) {
                    _this.sendToWeb();
                    return;
                }
                _this.faceData['Face']['FaceId'] = faceId;
                _this.faceData['Face']['ImageId'] = imageId;
                _this.form.patchValue({
                    profileImagePath: profileImagePath
                });
                _this.profileImagePath = api_1.ApiConstants.webURL + '/' + _this.form.value.profileImagePath;
                _this.visitorDetail = null;
                _this.showSection('contact');
            }
            else if (_this.visitorContact) {
                if (_this.checkTime(time) == false) {
                    _this.sendToWeb();
                    return;
                }
                _this.getVisitorProfile(_this.visitorContact);
            }
            else {
                if (_this.currentBranch && _this.currentBranch.isTouchless !== false) {
                    _this.showSection('image');
                    _this.autoCaptureImage(4000);
                }
                else {
                    _this.showSection('contact');
                }
            }
        });
        //get visitor category
        // this.getVisitorCategories();
        //get visitor detail
        // this.visitorContact = localStorage.getItem('contact');
        // if (this.visitorContact)
        //   this.getVisitorProfile(this.visitorContact);
        //get employees for dropdown
        var access_token = localStorage.getItem('access_token');
        if (access_token)
            this.getEmployees();
    };
    ProfileComponent.prototype.checkTime = function (time) {
        this.now = new Date();
        // console.log(this.now.getTime())
        // console.log(time)
        if (this.now.getTime() > time)
            return false;
    };
    ProfileComponent.prototype.sendToWeb = function () {
        this.toastr.error(message_1.MessageConstants.linkExpire, 'Error', { timeOut: 3000 });
        this.timeout = setTimeout(function () {
            window.location.replace(website_1.WebsiteConstants.websiteUrl);
        }, 3000);
    };
    ProfileComponent.prototype.reloadOnce = function () {
        if (!localStorage.getItem('firstLoad')) {
            localStorage['firstLoad'] = true;
            this.refresh();
        }
        else
            localStorage.removeItem('firstLoad');
    };
    // speechEventParent($event) {
    // this.speechText = $event;
    // console.log(this.speechText)
    // this.speechEventAction()
    // }
    // speechEventAction() {
    // console.log(this.onProfile)
    // console.log(this.onHost)
    // if (this.speechText === 'cancel')
    //   this.router.navigate(['/']);
    // if (this.speechText === 'back' || this.speechText === 'bag' || this.speechText === 'beg')
    //   this.backClicked();
    // if (this.speechText === 'next' && this.onProfile)
    //   this.nextToHost()
    // if (this.speechText === 'next' && this.onHost)
    //   this.nextToSummary();
    // if (this.speechText !== '' && this.speechText !== 'next' && this.onHost) {
    //   this.whomToMeetSpeechText = this.speechText;
    //   this.searchEmployee()
    // }
    // }
    // searchEmployee() {
    //   this.searchedEmployee = this.options.filter(employee =>
    //     employee.firstname + ' ' + employee.lastname == this.whomToMeetSpeechText
    //   )
    // }
    ProfileComponent.prototype.createNewVisitorQrCodeUrlValue = function () {
        var access_token = localStorage.getItem('access_token');
        var faceId = this.faceData.Face.FaceId;
        var imageId = this.faceData.Face.ImageId;
        var profileImagePath = this.form.value.profileImagePath;
        var host = api_1.ApiConstants.messageWebURL;
        this.now = new Date();
        this.now.setMinutes(this.now.getMinutes() + 2);
        // console.log(this.now)
        var queryParams = { 'access_token': access_token ? access_token : '', 'faceId': faceId ? faceId : '', 'imageId': imageId ? imageId : '', 'profileImagePath': profileImagePath ? profileImagePath : '', isVisitorNew: true, 'time': this.now.getTime() };
        var urlTree = this.router.createUrlTree([], { queryParams: queryParams });
        var url = host + urlTree;
        // console.log(url)
        // console.log(this.now)
        this.createTinyUrl(url);
        // this.showSection('qrcode')
        // this.qrCodeValue += urlTree
        //this.setBarcodeDisableTimer(60000)
        // console.log(this.qrCodeValue)
    };
    ProfileComponent.prototype.createOldVisitorUrlValue = function () {
        var access_token = localStorage.getItem('access_token');
        var visitorId = this.visitorDetail._id;
        var visitorContact = this.visitorDetail.contact;
        // let host = window.location.protocol + '//' + window.location.host + '';
        var host = api_1.ApiConstants.messageWebURL;
        this.now = new Date();
        this.now.setMinutes(this.now.getMinutes() + 2);
        var queryParams = { 'access_token': access_token ? access_token : '', 'visitorId': visitorId ? visitorId : '', 'contact': visitorContact ? visitorContact : '', 'time': this.now.getTime() };
        var urlTree = this.router.createUrlTree([], { queryParams: queryParams });
        var url = host + urlTree;
        // console.log(url)
        // console.log(this.now)
        this.createTinyUrl(url);
    };
    ProfileComponent.prototype.autoCaptureImage = function (time) {
        var _this = this;
        this.interval = '';
        this.startTimer(time / 1000);
        // set time out in sec
        this.timeout = setTimeout(function () {
            $('#takesnapshot').trigger('click');
            if (_this.currentBranch && _this.currentBranch.isTouchless !== false)
                _this.recognizeFace();
            else
                _this.showSection('profileImage');
        }, time);
        // });
    };
    ProfileComponent.prototype.startTimer = function (time) {
        var _this = this;
        this.timeLeft = time;
        if (this.interval)
            clearInterval(this.interval);
        this.interval = setInterval(function () {
            if (_this.timeLeft > 0) {
                _this.timeLeft = _this.timeLeft - 1;
            }
            else {
                _this.timeLeft = 0;
            }
        }, 1000);
    };
    ProfileComponent.prototype.setBarcodeDisableTimer = function (time) {
        var _this = this;
        var timer = time / 1000;
        this.timeout = setTimeout(function () {
            _this.router.navigate(['home']);
        }, time);
        this.startTimer(timer);
    };
    ProfileComponent.prototype.recognizeFace = function () {
        var _this = this;
        var data = {
            "collection_name": this.currentCompany ? this.currentCompany.collectionName : api_1.ApiConstants.defaultCollectionName,
            "image": this.webcamImage ? this.webcamImage.imageAsBase64 : ''
        };
        this.recognizeFaceService = this.faceService.recognize(data)
            .subscribe(function (res) {
            _this.isFaceData = true;
            if (res.success == true && res.statusCode == 200 && res.data !== null) {
                // this.form.value.visitorVisit = 'old'
                _this.faceData = res.data;
                _this.getVisitorByFace();
                // this.nextToProfile();
            }
            else {
                _this.addFace();
                _this.visitorDetail = null;
            }
        }, function (err) {
            _this.checkResponse('recognizeFace');
            console.log(err);
        });
    };
    ProfileComponent.prototype.addFace = function () {
        var _this = this;
        var data = {
            "collection_name": this.currentCompany ? this.currentCompany.collectionName : api_1.ApiConstants.defaultCollectionName,
            "image": this.webcamImage ? this.webcamImage.imageAsBase64 : ''
        };
        this.faceService.add(data)
            .subscribe(function (res) {
            if (res.success == true && res.statusCode == 200 && res.data !== null) {
                _this.faceData = res.data;
                _this.saveProfileImage();
            }
            else {
                _this.toastr.error(message_1.MessageConstants.noFaceError, 'Error', { timeOut: 5000 });
                _this.timeout = setTimeout(function () {
                    _this.router.navigate(['home']);
                }, 5000);
            }
        }, function (err) {
            _this.checkResponse('addFace');
            console.log(err);
        });
    };
    ProfileComponent.prototype.createTinyUrl = function (longurl) {
        var _this = this;
        // this.spinnerService.show()
        var data = {
            "url": longurl
        };
        this.otpService.tinyUrl(data)
            .subscribe(function (res) {
            // this.spinnerService.hide();
            if (res.success == true && res.statusCode == 200) {
                if (_this.visitorDetail !== null) {
                    _this.sendOtpToOldVisitor(res.data);
                }
                _this.qrCodeValue = res.data;
                _this.setBarcodeDisableTimer(45000);
                _this.showSection('qrcode');
            }
        }, function (err) {
            console.log(err);
            _this.checkResponse('createTinyUrl', longurl);
            _this.spinnerService.hide();
        });
    };
    ProfileComponent.prototype.sendOtpToOldVisitor = function (shorturl) {
        var _this = this;
        // this.spinnerService.show();
        var data = {
            shorturl: shorturl,
            contact: this.visitorDetail.contact,
            name: this.visitorDetail.name,
            company: this.currentCompany ? this.currentCompany._id : '',
            companyName: this.currentCompany ? this.currentCompany.name : ''
        };
        this.otpService.sendOldVisitor(data)
            .subscribe(function (res) {
            // this.spinnerService.hide();
            if (res.success == true && res.statusCode == 200) {
                _this.toastr.success(message_1.MessageConstants.oldVisitorMessage, 'Success', { timeOut: 5000 });
                // setTimeout(() => {
                //   this.router.navigate(['/'])
                // }, 5000);
            }
            else if (res.success == false) {
                _this.toastr.error(res.message, 'Error', { timeOut: 4000 });
            }
            else {
                _this.toastr.error(message_1.MessageConstants.serverError, 'Error', { timeOut: 6000 });
            }
        }, function (err) {
            console.log(err);
            _this.checkResponse('sendOtpToOldVisitor', shorturl);
            _this.spinnerService.hide();
        });
    };
    ProfileComponent.prototype.saveProfileImage = function () {
        var _this = this;
        // this.spinnerService.show()
        var data = {
            "avatar": this.webcamImage ? this.webcamImage.imageAsBase64 : ''
        };
        this.visitorService.saveProfileAvatar(data)
            .subscribe(function (res) {
            // this.spinnerService.hide();
            if (res.success == true && res.statusCode == 200) {
                _this.form.patchValue({
                    profileImagePath: res.data
                });
                _this.createNewVisitorQrCodeUrlValue();
                // console.log(res.data)
            }
        }, function (err) {
            console.log(err);
            _this.checkResponse('saveProfileImage');
            _this.spinnerService.hide();
        });
    };
    ProfileComponent.prototype.getVisitorByFace = function () {
        var _this = this;
        this.visitorService.getVisitorByFace(this.faceData).subscribe(function (res) {
            if (res.success == true && res.statusCode == 200 && res.data !== null) {
                _this.visitorDetail = res.data.visitor;
                _this.createOldVisitorUrlValue();
                // this.setDetail(res.data.visitor);
                // this.onProfile = true;
                // this.showSection('profile')
            }
            else {
                _this.visitorDetail = null;
                _this.saveProfileImage();
                // this.createNewVisitorQrCodeUrlValue();
            }
        }, function (err) {
            _this.checkResponse('getVisitorByFace');
            console.log(err);
        });
    };
    ProfileComponent.prototype.contactEventParent = function ($event) {
        // this.form.value.contact = $event;
        this.form.patchValue({
            contact: $event
        });
        if ((this.currentBranch && this.currentBranch.isTouchless !== false) || this.isVisitorNew || this.visitorContact)
            this.showSection('profile');
        this.getVisitorProfile($event);
        // else
    };
    ProfileComponent.prototype.showSection = function (section) {
        this.visitorCategory = section === 'visitorCategory' ? true : false;
        this.contact = section === 'contact' ? true : false;
        this.image = section === 'image' ? true : false;
        this.profileImage = section === 'profileImage' ? true : false;
        this.profile = section === 'profile' ? true : false;
        this.host = section === 'host' ? true : false;
        this.summary = section === 'summary' ? true : false;
        this.qrcode = section === 'qrcode' ? true : false;
    };
    Object.defineProperty(ProfileComponent.prototype, "f", {
        // convenience getter for easy access to form fields
        get: function () { return this.form.controls; },
        enumerable: false,
        configurable: true
    });
    ProfileComponent.prototype.onSubmit = function () {
        var _this = this;
        this.form.value.faceData = this.faceData;
        // this.form.value.contact = this.visitorContact;
        this.form.value.profileImage = this.webcamImage ? this.webcamImage.imageAsBase64 : '';
        this.form.value.company = this.currentCompany ? this.currentCompany._id : '';
        this.form.value.companyName = this.currentCompany ? this.currentCompany.name : '';
        this.form.value.visitorVisit = this.visitorDetail === null ? 'new' : '';
        if (this.webcamImage)
            this.form.value.profileImagePath = '';
        this.spinnerService.show();
        this.visitorService.save(this.form.value)
            .subscribe(function (res) {
            _this.spinnerService.hide();
            if (res.success == true && res.statusCode == 200) {
                localStorage.removeItem('contact');
                _this.toastr.success(res.message, 'Success', { timeOut: 4000 });
                _this.timeout = setTimeout(function () {
                    _this.redirect('');
                }, 4000);
            }
            else if (res.success == false) {
                _this.toastr.error(res.message, 'Error', { timeOut: 4000 });
            }
            else {
                _this.toastr.error(message_1.MessageConstants.serverError, 'Error', { timeOut: 6000 });
            }
        }, function (err) {
            console.log(err);
            _this.checkResponse('onSubmit');
            _this.spinnerService.hide();
        });
    };
    ProfileComponent.prototype.handleImage = function (webcamImage) {
        this.webcamImage = webcamImage;
    };
    ProfileComponent.prototype.retakeImage = function () {
        this.webcamImage = null;
        this.form.value.profileImagePath = '';
        this.showSection('image');
        this.autoCaptureImage(4000);
    };
    ProfileComponent.prototype.nextToImageCapture = function () {
        this.showSection('image');
    };
    ProfileComponent.prototype.nextToProfile = function () {
        this.showSection('profile');
    };
    ProfileComponent.prototype.nextToSummary = function () {
        this.submitted = true;
        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }
        this.showSection('summary');
    };
    ProfileComponent.prototype.selectionChanged = function (event) {
        if (event.value)
            this.form.value.whomToMeet = event.value;
    };
    ProfileComponent.prototype.selectedVisitorCategory = function (visitorCategory) {
        if (visitorCategory) {
            this.form.patchValue({
                visitorCategory: visitorCategory._id
            });
            this.nextToImageCapture();
        }
    };
    ProfileComponent.prototype.getVisitorProfile = function (contact) {
        var _this = this;
        this.visitorService.getProfileByContact(contact).subscribe(function (res) {
            if (res.success == true && res.statusCode == 200) {
                _this.visitorDetail = res.data.visitor;
                _this.setDetail(res.data.visitor);
                if (_this.isVisitorNew || _this.visitorContact)
                    _this.showSection('profile');
                else
                    _this.showSection('profileImage');
            }
            else {
                _this.showSection('image');
                _this.autoCaptureImage(4000);
            }
        }, function (err) {
            _this.checkResponse('getVisitorProfile', contact);
            console.log(err);
        });
    };
    ProfileComponent.prototype.setDetail = function (data) {
        this.form.setValue({
            name: data.name,
            email: data.email,
            contact: data.contact,
            whomToMeet: '',
            companyFrom: data.companyFrom,
            isLaptop: data.isLaptop,
            serialNumber: data.serialNumber,
            profileImage: '',
            profileImagePath: data.profileImagePath,
            signatureImagePath: '',
            visitorCategory: '',
            approvalStatus: '',
            company: [''],
            companyName: '',
            visitorVisit: ''
        });
        this.profileImagePath = api_1.ApiConstants.webURL + '/' + data.profileImagePath;
    };
    ProfileComponent.prototype.getVisitorCategories = function () {
        var _this = this;
        this.visitorcategoriesService.getVisitorCategories()
            .subscribe(function (res) {
            if (res.success == true && res.statusCode == 200) {
                _this.visitorCategories = res.data.visitorCategories;
                if (_this.visitorCategories)
                    _this.updateImagePath(_this.visitorCategories);
                _this.checkVisitorCategoriesListLength();
            }
        }, function (err) {
            console.log(err);
        });
    };
    ProfileComponent.prototype.checkVisitorCategoriesListLength = function () {
        if (this.visitorCategories && this.visitorCategories.length)
            // this.visitorCategory = true;
            this.image = true;
        else
            this.image = true;
    };
    ProfileComponent.prototype.updateImagePath = function (data) {
        data.forEach(function (value) {
            if (value.backgroundImagePath) {
                value.backgroundImagePath = api_1.ApiConstants.webURL + '/' + value.backgroundImagePath;
            }
        });
    };
    ProfileComponent.prototype.getEmployees = function () {
        var _this = this;
        this.employeeService.getEmployees().subscribe(function (res) {
            var employees = [];
            if (res.success == true && res.statusCode == 200) {
                employees = res.data.employees;
                if (employees.length) {
                    employees.forEach(function (employee) {
                        employee.name = employee.firstname + ' ' + employee.lastname + (employee.department && employee.department !== null ? ' - ' + employee.department.name : '');
                    });
                }
                _this.options = employees;
            }
        }, function (err) {
            _this.checkResponse('getEmployees');
            console.log(err);
        });
    };
    ProfileComponent.prototype.backClicked = function () {
        this._location.back();
    };
    ProfileComponent.prototype.refresh = function () {
        window.location.reload();
    };
    ProfileComponent.prototype.redirect = function (redirectTo) {
        var access_token = localStorage.getItem('access_token');
        var user = localStorage.getItem('user');
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = 0;
        }
        if (this.interval)
            clearInterval(this.interval);
        if (!access_token || !user) {
            localStorage.removeItem('access_token');
            // this.router.navigate(['login']);
            window.location.replace(website_1.WebsiteConstants.websiteUrl);
        }
        else if (redirectTo === 'back')
            this.backClicked();
        else
            this.router.navigate(['']);
    };
    ProfileComponent.prototype.interruptToHome = function () {
        var _this = this;
        this.timeout = setTimeout(function () {
            _this.router.navigate(['home']);
        }, 3000);
    };
    ProfileComponent.prototype.checkResponse = function (funcName, param) {
        if (funcName === void 0) { funcName = ''; }
        if (param === void 0) { param = ''; }
        if (funcName === 'recognizeFace' || funcName === 'addFace')
            this.toastr.error(message_1.MessageConstants.faceResponseError, 'Error', { timeOut: 3000 });
        else
            this.toastr.error(message_1.MessageConstants.responseError, 'Error', { timeOut: 3000 });
        this.interruptToHome();
        // if (funcName === 'recognizeFace' || funcName === 'addFace') {
        //   if (this.errorCount == 4) {
        //     this.errorCount = 0
        //     this.toastr.error(MessageConstants.faceResponseError, 'Error', { timeOut: 3000 })
        //     this.interruptToHome()
        //   } else if (this.errorCount < 5) {
        //     this.errorCount++
        //     if (funcName === 'recognizeFace')
        //       this.recognizeFace()
        //     else if (funcName === 'addFace')
        //       this.addFace()
        //   }
        // } else {
        //   this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
        //   this.interruptToHome()
        // }
        // if (this.errorCount == 5) {
        //   this.errorCount = 0
        //   if (funcName === 'recognizeFace' || funcName === 'addFace' || funcName === 'getVisitorByFace' || funcName === 'createTinyUrl' || funcName === 'sendOtpToOldVisitor')
        //     this.toastr.error(MessageConstants.faceResponseError, 'Error', { timeOut: 3000 })
        //   else
        //     this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
        //   this.interruptToHome()
        // } else if (this.errorCount < 5) {
        //   this.errorCount++
        //   if (funcName === 'recognizeFace')
        //     this.recognizeFace()
        //   else if (funcName === 'addFace')
        //     this.addFace()
        //   else if (funcName === 'getVisitorByFace')
        //     this.getVisitorByFace()
        //   else if (funcName === 'getVisitorProfile')
        //     this.getVisitorProfile(param)
        //   else if (funcName === 'createTinyUrl')
        //     this.createTinyUrl(param)
        //   else if (funcName === 'sendOtpToOldVisitor')
        //     this.sendOtpToOldVisitor(param)
        //   else if (funcName === 'saveProfileImage')
        //     this.saveProfileImage()
        //   else if (funcName === 'getEmployees')
        //     this.getEmployees()
        //   else if (funcName === 'onSubmit')
        //     this.onSubmit()
        // }
    };
    ProfileComponent = __decorate([
        core_1.Component({
            selector: 'app-profile',
            templateUrl: './profile.component.html',
            styleUrls: ['./profile.component.css']
        })
    ], ProfileComponent);
    return ProfileComponent;
}());
exports.ProfileComponent = ProfileComponent;
