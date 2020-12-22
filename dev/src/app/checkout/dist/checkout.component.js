"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CheckoutComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var message_1 = require("../_common/constants/message");
var api_1 = require("../_common/constants/api");
var $ = require("jquery");
var CheckoutComponent = /** @class */ (function () {
    function CheckoutComponent(router, formBuilder, visitorService, spinnerService, toastr, _location, faceService) {
        this.router = router;
        this.formBuilder = formBuilder;
        this.visitorService = visitorService;
        this.spinnerService = spinnerService;
        this.toastr = toastr;
        this._location = _location;
        this.faceService = faceService;
        this.webcamImage = null;
        this.submitted = false;
        this.currentCompany = {};
        this.contact = false;
        this.image = false;
        this.branchDetail = {};
        this.visitorDetail = {};
        this.timeLeft = 8;
        this.errorCount = 0;
        this.faceData = {
            Face: {
                FaceId: '',
                ImageId: ''
            }
        };
    }
    CheckoutComponent.prototype.ngOnInit = function () {
        this.currentCompany = JSON.parse(localStorage.getItem('company'));
        this.branchDetail = JSON.parse(localStorage.getItem('branch'));
        this.loaderSpinnerMessage = message_1.MessageConstants.loaderMessage;
        this.form = this.formBuilder.group({
            contact: ['', [forms_1.Validators.required, forms_1.Validators.minLength(10)]]
        });
        if (this.branchDetail && this.branchDetail.isTouchless && this.branchDetail.isTouchless !== undefined) {
            this.showSection('image');
            this.autoCaptureImage(4000);
        }
        else
            this.showSection('contact');
    };
    CheckoutComponent.prototype.autoCaptureImage = function (time) {
        var _this = this;
        this.startTimer(time / 1000);
        // set time out in sec
        setTimeout(function () {
            $('#takesnapshot').trigger('click');
            _this.recognizeFace();
        }, time);
        // });
    };
    CheckoutComponent.prototype.startTimer = function (time) {
        var _this = this;
        this.timeLeft = time;
        this.interval = setInterval(function () {
            if (_this.timeLeft > 0) {
                _this.timeLeft = _this.timeLeft - 1;
            }
            else {
                _this.timeLeft = 0;
            }
        }, 1000);
    };
    CheckoutComponent.prototype.recognizeFace = function () {
        var _this = this;
        var data = {
            "collection_name": this.currentCompany ? this.currentCompany.collectionName : api_1.ApiConstants.defaultCollectionName,
            "image": this.webcamImage ? this.webcamImage.imageAsBase64 : ''
        };
        this.faceService.recognize(data)
            .subscribe(function (res) {
            if (res.success == true && res.statusCode == 200) {
                if (res.data !== null) {
                    _this.faceData = res.data;
                    _this.getVisitorByFace();
                }
                else {
                    _this.toastr.error(message_1.MessageConstants.noRelatedFaceError, 'Error', { timeOut: 5000 });
                    setTimeout(function () {
                        _this.showSection('contact');
                    }, 5000);
                }
            }
        }, function (err) {
            _this.checkResponse('recognizeFace');
            console.log(err);
        });
    };
    CheckoutComponent.prototype.getVisitorByFace = function () {
        var _this = this;
        this.visitorService.getVisitorByFace(this.faceData).subscribe(function (res) {
            if (res.success == true && res.statusCode == 200 && res.data !== null) {
                _this.visitorDetail = res.data.visitor;
                _this.form.setValue({
                    contact: _this.visitorDetail.contact
                });
                _this.checkout();
            }
            else {
                _this.visitorDetail = null;
                _this.toastr.error(message_1.MessageConstants.noRelatedFaceError, 'Error', { timeOut: 5000 });
                setTimeout(function () {
                    _this.router.navigate(['home']);
                }, 5000);
                // setTimeout(() => {
                //   this.showSection('contact')
                // }, 5000);
            }
        }, function (err) {
            _this.checkResponse('getVisitorByFace');
            console.log(err);
        });
    };
    CheckoutComponent.prototype.handleImage = function (webcamImage) {
        this.webcamImage = webcamImage;
    };
    CheckoutComponent.prototype.showSection = function (section) {
        this.contact = section === 'contact' ? true : false;
        this.image = section === 'image' ? true : false;
    };
    Object.defineProperty(CheckoutComponent.prototype, "f", {
        // convenience getter for easy access to form fields
        get: function () { return this.form.controls; },
        enumerable: false,
        configurable: true
    });
    CheckoutComponent.prototype.numberEvent = function (key) {
        if (key == 'delete') {
            this.form.setValue({
                contact: this.form.value.contact.slice(0, -1)
            });
        }
        else if (key == 'go') {
            this.checkout();
        }
        else {
            this.form.setValue({
                contact: this.form.value.contact + key
            });
        }
    };
    CheckoutComponent.prototype.checkout = function () {
        var _this = this;
        this.submitted = true;
        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }
        this.spinnerService.show();
        var data = {
            contact: this.form.value.contact,
            signOut: new Date(),
            company: this.currentCompany ? this.currentCompany._id : ''
        };
        this.visitorService.checkout(data)
            .subscribe(function (res) {
            _this.spinnerService.hide();
            if (res.success == true && res.statusCode == 200) {
                _this.toastr.success(res.message, 'Success', { timeOut: 4000 });
                setTimeout(function () {
                    _this.router.navigate(['home']);
                }, 4000);
            }
            else if (res.success == false) {
                _this.toastr.error((res.message ? res.message : message_1.MessageConstants.serverError), 'Error', { timeOut: 3000 });
            }
            else {
                _this.toastr.error((res.message ? res.message : message_1.MessageConstants.serverError), 'Error', { timeOut: 4000 });
            }
        }, function (err) {
            console.log(err);
            _this.checkResponse('checkout');
            _this.spinnerService.hide();
            // this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 6000 })
        });
    };
    CheckoutComponent.prototype.redirect = function (redirectTo) {
        var access_token = localStorage.getItem('access_token');
        var user = localStorage.getItem('user');
        if (!access_token || !user)
            this.router.navigate(['login']);
        else if (redirectTo === 'back')
            this.backClicked();
        else
            this.router.navigate(['']);
    };
    CheckoutComponent.prototype.interruptToHome = function () {
        var _this = this;
        // this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
        setTimeout(function () {
            _this.router.navigate(['home']);
        }, 3000);
    };
    CheckoutComponent.prototype.backClicked = function () {
        this._location.back();
    };
    CheckoutComponent.prototype.checkResponse = function (funcName, param) {
        if (funcName === void 0) { funcName = ''; }
        if (param === void 0) { param = ''; }
        if (funcName === 'recognizeFace')
            this.toastr.error(message_1.MessageConstants.faceResponseError, 'Error', { timeOut: 3000 });
        else
            this.toastr.error(message_1.MessageConstants.responseError, 'Error', { timeOut: 3000 });
        this.interruptToHome();
        // if (funcName === 'recognizeFace') {
        //   if (this.errorCount == 4) {
        //     this.errorCount = 0
        //     this.toastr.error(MessageConstants.faceResponseError, 'Error', { timeOut: 3000 })
        //     this.interruptToHome()
        //   } else if (this.errorCount < 5) {
        //     this.errorCount++
        //     if (funcName === 'recognizeFace')
        //       this.recognizeFace()
        //   }
        // } else {
        //   this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
        //   this.interruptToHome()
        // }
        // if (this.errorCount == 5) {
        //   this.errorCount = 0
        //   if (funcName === 'recognizeFace')
        //     this.toastr.error(MessageConstants.faceResponseError, 'Error', { timeOut: 3000 })
        //   else
        //     this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
        //   this.interruptToHome()
        // } else if (this.errorCount < 5) {
        //   this.errorCount++
        //   if (funcName === 'recognizeFace')
        //     this.recognizeFace()
        //   else if (funcName === 'checkout')
        //     this.checkout()
        // }
    };
    CheckoutComponent = __decorate([
        core_1.Component({
            selector: 'app-checkout',
            templateUrl: './checkout.component.html',
            styleUrls: ['./checkout.component.css']
        })
    ], CheckoutComponent);
    return CheckoutComponent;
}());
exports.CheckoutComponent = CheckoutComponent;
