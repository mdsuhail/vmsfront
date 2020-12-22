"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.VisitorApproveComponent = void 0;
var core_1 = require("@angular/core");
var message_1 = require("../_common/constants/message");
var website_1 = require("../_common/constants/website");
var api_1 = require("@app/_common/constants/api");
var VisitorApproveComponent = /** @class */ (function () {
    function VisitorApproveComponent(router, route, SpinnerService, toastr, visitorService) {
        this.router = router;
        this.route = route;
        this.SpinnerService = SpinnerService;
        this.toastr = toastr;
        this.visitorService = visitorService;
        this.data = {};
        this.isData = false;
        this.params = {};
    }
    VisitorApproveComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log('here');
        this.loaderSpinnerMessage = message_1.MessageConstants.loaderMessage;
        this.route.queryParams.subscribe(function (params) {
            _this.params = {
                company: params['company'] && params['company'] !== null ? params['company'] : '',
                branch: params['branch'] && params['branch'] !== null ? params['branch'] : '',
                prefix: params['prefix'] && params['prefix'] !== null ? params['prefix'] : ''
            };
            _this.visitorId = params['vid'];
            if (_this.visitorId && _this.visitorId != undefined)
                _this.getVisitor(_this.visitorId, _this.params);
        });
        // this.route.params.subscribe(params => {
        //   // this.visitorId = params['id'];
        //   this.visitorId = '5f3b894850d9aa5d77ae1efb';
        //   console.log(this.visitorId)
        //   if (this.visitorId && this.visitorId != undefined)
        //     this.getVisitor(this.visitorId, this.params);
        // });
    };
    // Visitor detail
    VisitorApproveComponent.prototype.getVisitor = function (id, params) {
        var _this = this;
        this.SpinnerService.show();
        this.visitorService.getVisitor(id, params)
            .subscribe(function (res) {
            _this.SpinnerService.hide();
            if (res.success == true && res.statusCode == 200) {
                _this.data = res.data.visitor;
                _this.data.profileImagePath = _this.data.profileImagePath && _this.data.profileImagePath !== null ? api_1.ApiConstants.webURL + '/' + _this.data.profileImagePath : website_1.WebsiteConstants.personsLogo;
                _this.isData = true;
            }
        }, function (err) {
            console.log(err);
            _this.SpinnerService.hide();
        });
    };
    //visitor approve or disapprove
    VisitorApproveComponent.prototype.approvalStatus = function (status) {
        var _this = this;
        this.data['approvalStatus'] = status;
        this.SpinnerService.show();
        this.visitorService.approvalStatus(this.visitorId, this.data, this.params)
            .subscribe(function (res) {
            _this.SpinnerService.hide();
            if (res.success == true && res.statusCode == 200) {
                _this.toastr.success(res.message, 'Success', { timeOut: 4000 });
            }
            else if (res.success == false) {
                _this.toastr.error(res.message, 'Error', { timeOut: 4000 });
            }
            else {
                _this.toastr.error(message_1.MessageConstants.serverError, 'Error', { timeOut: 6000 });
            }
        }, function (err) {
            console.log(err);
            _this.SpinnerService.hide();
        });
    };
    VisitorApproveComponent = __decorate([
        core_1.Component({
            selector: 'app-visitor-approve',
            templateUrl: './visitor-approve.component.html',
            styleUrls: ['./visitor-approve.component.css']
        })
    ], VisitorApproveComponent);
    return VisitorApproveComponent;
}());
exports.VisitorApproveComponent = VisitorApproveComponent;
