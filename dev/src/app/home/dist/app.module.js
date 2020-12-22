"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var animations_1 = require("@angular/platform-browser/animations");
var platform_browser_1 = require("@angular/platform-browser");
var router_1 = require("@angular/router");
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/common/http");
var ngx_spinner_1 = require("ngx-spinner");
var ngx_toastr_1 = require("ngx-toastr");
var ngx_webcam_1 = require("ngx-webcam");
var ngx_select_dropdown_1 = require("ngx-select-dropdown");
var an_qrcode_1 = require("an-qrcode");
// used to create fake backend
var _helpers_1 = require("./_helpers");
var app_component_1 = require("./app.component");
var app_routing_1 = require("./app.routing");
var _helpers_2 = require("./_helpers");
var home_component_1 = require("./home/home.component");
var contact_component_1 = require("./contact/contact.component");
var profile_component_1 = require("./profile/profile.component");
var camera_component_1 = require("./camera/camera.component");
var checkout_component_1 = require("./checkout/checkout.component");
var login_1 = require("./login");
;
var visitor_approve_component_1 = require("./visitor-approve/visitor-approve.component");
var shared_module_1 = require("./shared/shared.module");
// import { WebSpeechModule } from './web-speech/web-speech.module';
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                common_1.CommonModule,
                animations_1.BrowserAnimationsModule,
                forms_1.ReactiveFormsModule,
                http_1.HttpClientModule,
                app_routing_1.appRoutingModule,
                ngx_spinner_1.NgxSpinnerModule,
                ngx_toastr_1.ToastrModule.forRoot(),
                ngx_webcam_1.WebcamModule,
                ngx_select_dropdown_1.SelectDropDownModule,
                shared_module_1.SharedModule,
                // WebSpeechModule,
                an_qrcode_1.AnQrcodeModule,
                router_1.RouterModule
            ],
            declarations: [
                app_component_1.AppComponent,
                home_component_1.HomeComponent,
                contact_component_1.ContactComponent,
                profile_component_1.ProfileComponent,
                camera_component_1.CameraComponent,
                checkout_component_1.CheckoutComponent,
                login_1.LoginComponent,
                visitor_approve_component_1.VisitorApproveComponent
            ],
            providers: [
                { provide: http_1.HTTP_INTERCEPTORS, useClass: _helpers_2.BasicAuthInterceptor, multi: true },
                { provide: http_1.HTTP_INTERCEPTORS, useClass: _helpers_2.ErrorInterceptor, multi: true },
                // provider used to create fake backend
                _helpers_1.fakeBackendProvider
            ],
            schemas: [
                core_1.CUSTOM_ELEMENTS_SCHEMA
            ],
            bootstrap: [app_component_1.AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
