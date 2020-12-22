import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxSpinnerModule } from "ngx-spinner";
import { ToastrModule } from 'ngx-toastr';
import { WebcamModule } from 'ngx-webcam';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { AnQrcodeModule } from 'an-qrcode';

// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { AppComponent } from './app.component';
import { appRoutingModule } from './app.routing';

import { BasicAuthInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { ProfileComponent } from './profile/profile.component';
import { CameraComponent } from './camera/camera.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { LoginComponent } from './login';;
import { VisitorApproveComponent } from './visitor-approve/visitor-approve.component'
import { SharedModule } from './shared/shared.module';
// import { WebSpeechModule } from './web-speech/web-speech.module';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    appRoutingModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(), // ToastrModule added,
    WebcamModule,
    SelectDropDownModule,
    SharedModule,
    // WebSpeechModule,
    AnQrcodeModule,
    RouterModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ContactComponent,
    ProfileComponent,
    CameraComponent,
    CheckoutComponent,
    LoginComponent,
    VisitorApproveComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // provider used to create fake backend
    fakeBackendProvider
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
