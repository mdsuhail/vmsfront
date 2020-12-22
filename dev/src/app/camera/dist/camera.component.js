"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CameraComponent = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
//import {Observable} from 'rxjs/Observable';
var ngx_webcam_1 = require("ngx-webcam");
var jquery_1 = require("jquery");
var CameraComponent = /** @class */ (function () {
    function CameraComponent() {
        this.pictureTaken = new core_1.EventEmitter();
        // toggle webcam on/off
        this.showWebcam = true;
        this.allowCameraSwitch = true;
        this.multipleWebcamsAvailable = false;
        this.videoOptions = {
            width: { ideal: 1280 },
            height: { ideal: 720 }
        };
        this.errors = [];
        // webcam snapshot trigger
        this.trigger = new rxjs_1.Subject();
        // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
        this.nextWebcam = new rxjs_1.Subject();
    }
    CameraComponent.prototype.ngOnInit = function () {
        var _this = this;
        ngx_webcam_1.WebcamUtil.getAvailableVideoInputs()
            .then(function (mediaDevices) {
            _this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
        });
    };
    CameraComponent.prototype.ngAfterViewInit = function () {
        jquery_1["default"]("webcam").attr("width", "100% !important").attr("height", "100% !important");
        jquery_1["default"]("video").attr("width", "100% !important").attr("height", "100% !important");
        jquery_1["default"]("canvas").attr("width", "100% !important").attr("height", "100% !important");
    };
    CameraComponent.prototype.triggerSnapshot = function () {
        this.trigger.next();
    };
    CameraComponent.prototype.toggleWebcam = function () {
        this.showWebcam = !this.showWebcam;
    };
    CameraComponent.prototype.handleInitError = function (error) {
        this.errors.push(error);
    };
    CameraComponent.prototype.showNextWebcam = function (directionOrDeviceId) {
        // true => move forward through devices
        // false => move backwards through devices
        // string => move to device with given deviceId
        this.nextWebcam.next(directionOrDeviceId);
    };
    CameraComponent.prototype.handleImage = function (webcamImage) {
        //console.info('received webcam image', webcamImage);
        this.pictureTaken.emit(webcamImage);
    };
    CameraComponent.prototype.cameraWasSwitched = function (deviceId) {
        //console.log('active device: ' + deviceId);
        this.deviceId = deviceId;
    };
    Object.defineProperty(CameraComponent.prototype, "triggerObservable", {
        get: function () {
            return this.trigger.asObservable();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CameraComponent.prototype, "nextWebcamObservable", {
        get: function () {
            return this.nextWebcam.asObservable();
        },
        enumerable: false,
        configurable: true
    });
    __decorate([
        core_1.Output()
    ], CameraComponent.prototype, "pictureTaken");
    CameraComponent = __decorate([
        core_1.Component({
            selector: 'app-camera',
            templateUrl: './camera.component.html',
            styleUrls: ['./camera.component.css']
        })
    ], CameraComponent);
    return CameraComponent;
}());
exports.CameraComponent = CameraComponent;
