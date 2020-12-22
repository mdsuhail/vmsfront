"use strict";
exports.__esModule = true;
exports.appRoutingModule = void 0;
var router_1 = require("@angular/router");
var home_component_1 = require("./home/home.component");
var contact_component_1 = require("./contact/contact.component");
var profile_component_1 = require("./profile/profile.component");
var checkout_component_1 = require("./checkout/checkout.component");
var visitor_approve_component_1 = require("./visitor-approve/visitor-approve.component");
var login_1 = require("./login");
var _helpers_1 = require("./_helpers");
var routes = [
    { path: 'home', canActivate: [_helpers_1.AuthGuard], component: home_component_1.HomeComponent },
    { path: 'contact', canActivate: [_helpers_1.AuthGuard], component: contact_component_1.ContactComponent },
    { path: 'profile', canActivate: [_helpers_1.AuthGuard], component: profile_component_1.ProfileComponent },
    { path: 'checkout', canActivate: [_helpers_1.AuthGuard], component: checkout_component_1.CheckoutComponent },
    { path: 'approve', component: visitor_approve_component_1.VisitorApproveComponent },
    { path: 'login', component: login_1.LoginComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: 'home' }
];
exports.appRoutingModule = router_1.RouterModule.forRoot(routes);
