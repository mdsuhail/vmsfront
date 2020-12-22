"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.HomeComponent = void 0;
var core_1 = require("@angular/core");
var api_1 = require("../_common/constants/api");
// import * as handTrack from 'handtrackjs';
var HomeComponent = /** @class */ (function () {
    function HomeComponent(router, companyService, authService, ngZone) {
        this.router = router;
        this.companyService = companyService;
        this.authService = authService;
        this.ngZone = ngZone;
        this.currentCompany = {};
        this.currentBranch = {};
        this.compression = 5;
        this.width = 0;
        this.height = 0;
        this.huemin = 0.0;
        this.huemax = 0.10;
        this.satmin = 0.0;
        this.satmax = 1.0;
        this.valmin = 0.4;
        this.valmax = 1.0;
        this.thresh = 150;
        this.movethresh = 2;
        this.brightthresh = 800;
        this.overthresh = 1000;
        this.avg = 0;
        this.state = 0; //States: 0 waiting for gesture, 1 waiting for next move after gesture, 2 waiting for gesture to end
    }
    HomeComponent.prototype.ngOnInit = function () {
        this.currentCompany = JSON.parse(localStorage.getItem('company'));
        this.currentBranch = JSON.parse(localStorage.getItem('branch'));
        this.logoUrl = this.currentCompany ? api_1.ApiConstants.webURL + '/' + this.currentCompany.logo : '';
        if (!this.currentCompany) {
            this.getCompanyDetail();
        }
        if (this.currentBranch && this.currentBranch.isTouchless !== false) {
            this.video = document.getElementById('home_video');
            this.canvas = document.getElementById('home_canvas');
            this.context = this.canvas.getContext('2d');
            this.startVideo();
        }
    };
    HomeComponent.prototype.checkOut = function () {
        this.stopVideo();
        this.router.navigate(['checkout']);
    };
    HomeComponent.prototype.checkIn = function () {
        this.stopVideo();
        this.router.navigate(['profile']);
    };
    HomeComponent.prototype.startVideo = function () {
        var _this = this;
        navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
            _this.stream = stream;
            _this.video.srcObject = _this.stream;
            _this.video.play();
            setInterval(function () { _this.dump(); }, 1000 / 25);
        });
    };
    HomeComponent.prototype.stopVideo = function () {
        this.stream.getTracks().forEach(function (track) {
            track.stop();
        });
    };
    HomeComponent.prototype.dump = function () {
        if (this.canvas.width != this.video.videoWidth) {
            this.width = Math.floor(this.video.videoWidth / this.compression);
            this.height = Math.floor(this.video.videoHeight / this.compression);
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
        this.context.drawImage(this.video, this.width, 0, -this.width, this.height);
        this.draw = this.context.getImageData(0, 0, this.width, this.height);
        this.skinfilter();
        this.test();
    };
    HomeComponent.prototype.skinfilter = function () {
        var skin_filter, r, g, b, a, hsv;
        skin_filter = this.context.getImageData(0, 0, this.width, this.height);
        var total_pixels = skin_filter.width * skin_filter.height;
        var index_value = total_pixels * 4;
        var count_data_big_array = 0;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                index_value = x + y * this.width;
                r = this.draw.data[count_data_big_array];
                g = this.draw.data[count_data_big_array + 1];
                b = this.draw.data[count_data_big_array + 2];
                a = this.draw.data[count_data_big_array + 3];
                hsv = this.rgb2Hsv(r, g, b);
                //When the hand is too lose (hsv[0] > 0.59 && hsv[0] < 1.0)
                //Skin Range on HSV values
                if (((hsv[0] > this.huemin && hsv[0] < this.huemax) || (hsv[0] > 0.59 && hsv[0] < 1.0)) && (hsv[1] > this.satmin && hsv[1] < this.satmax) && (hsv[2] > this.valmin && hsv[2] < this.valmax)) {
                    skin_filter[count_data_big_array] = r;
                    skin_filter[count_data_big_array + 1] = g;
                    skin_filter[count_data_big_array + 2] = b;
                    skin_filter[count_data_big_array + 3] = a;
                }
                else {
                    skin_filter.data[count_data_big_array] =
                        skin_filter.data[count_data_big_array + 1] =
                            skin_filter.data[count_data_big_array + 2] = 0;
                    skin_filter.data[count_data_big_array + 3] = 0;
                }
                count_data_big_array = index_value * 4;
            }
        }
        this.draw = skin_filter;
    };
    HomeComponent.prototype.rgb2Hsv = function (r, g, b) {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max == 0 ? 0 : d / max;
        if (max == min) {
            h = 0; // achromatic
        }
        else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, v];
    };
    HomeComponent.prototype.test = function () {
        var delt;
        delt = this.context.createImageData(this.width, this.height);
        if (this.last) {
            var totalx = 0, totaly = 0, totald = 0, totaln = delt.width * delt.height, dscl = 0, pix = totaln * 4;
            while (pix -= 4) {
                var d = Math.abs(this.draw.data[pix] - this.last.data[pix]) + Math.abs(this.draw.data[pix + 1] - this.last.data[pix + 1]) + Math.abs(this.draw.data[pix + 2] - this.last.data[pix + 2]);
                if (d > this.thresh) {
                    delt.data[pix] = 160;
                    delt.data[pix + 1] = 255;
                    delt.data[pix + 2] =
                        delt.data[pix + 3] = 255;
                    totald += 1;
                    totalx += ((pix / 4) % this.width);
                    totaly += (Math.floor((pix / 4) / delt.height));
                }
                else {
                    delt.data[pix] =
                        delt.data[pix + 1] =
                            delt.data[pix + 2] = 0;
                    delt.data[pix + 3] = 0;
                }
            }
        }
        if (totald) {
            this.down = {
                x: totalx / totald,
                y: totaly / totald,
                d: totald
            };
            this.handledown();
        }
        this.last = this.draw;
    };
    HomeComponent.prototype.calibrate = function () {
        this.wasdown = {
            x: this.down.x,
            y: this.down.y,
            d: this.down.d
        };
    };
    HomeComponent.prototype.handledown = function () {
        this.avg = 0.9 * this.avg + 0.1 * this.down.d;
        var davg = this.down.d - this.avg, good = davg > this.brightthresh;
        // console.log('davg=' + davg)
        switch (this.state) {
            case 0:
                if (good) { //Found a gesture, waiting for next move
                    this.state = 1;
                    this.calibrate();
                }
                break;
            case 2: //Wait for gesture to end
                if (!good) { //Gesture ended
                    this.state = 0;
                }
                break;
            case 1: //Got next move, do something based on direction
                var dx = this.down.x - this.wasdown.x, dy = this.down.y - this.wasdown.y;
                var dirx = Math.abs(dy) < Math.abs(dx); //(dx,dy) is on a bowtie
                // console.log('good=' + good, 'dirx=' + dirx, 'dx=' + dx, 'dy=' + dy, 'davg=' + davg)
                //console.log(good,davg)
                // if (dx < -this.movethresh && dirx) {
                if (dx < -5.5 && dirx && good) {
                    this.stopVideo();
                    // console.log('right')
                    this.router.navigate(['profile']);
                    // Reveal.navigateRight()
                }
                // else if (dx > this.movethresh && dirx) {
                else if (dx > 3.4 && dirx && good) {
                    this.stopVideo();
                    // console.log('left')
                    this.router.navigate(['checkout']);
                    // Reveal.navigateLeft()
                }
                // if(dy>movethresh&&!dirx){
                // if(davg>overthresh){
                // console.log('over up')
                // Reveal.toggleOverview()
                // }
                // else{
                // console.log('up')
                // Reveal.navigateUp()
                // }
                // }
                // else if(dy<-movethresh&&!dirx){
                // if(davg>overthresh){
                // console.log('over down')
                // Reveal.toggleOverview()
                // }
                // else{
                // console.log('down')
                // Reveal.navigateDown()
                // }
                // }
                this.state = 2;
                break;
        }
    };
    HomeComponent.prototype.speechEventParent = function ($event) {
        this.speechText = $event;
        console.log(this.speechText);
        this.speechEventAction();
    };
    HomeComponent.prototype.speechEventAction = function () {
        if (this.speechText === 'checking' || this.speechText === 'check-in' || this.speechText === 'tekken' || this.speechText === 'chatting')
            this.router.navigate(['profile']);
        if (this.speechText === 'check out' || this.speechText === 'check-out' || this.speechText === 'checkout')
            this.router.navigate(['checkout']);
    };
    HomeComponent.prototype.getCompanyDetail = function () {
        this.companyService.getCompany().subscribe(function (res) {
            if (res.success == true && res.statusCode == 200) {
                localStorage.setItem('company', JSON.stringify(res.data.company));
            }
        });
    };
    HomeComponent.prototype.logout = function () {
        this.authService.logout();
    };
    HomeComponent.prototype.refresh = function () {
        window.location.reload();
    };
    HomeComponent = __decorate([
        core_1.Component({
            selector: 'app-home',
            templateUrl: './home.component.html',
            styleUrls: ['./home.component.css']
        })
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
