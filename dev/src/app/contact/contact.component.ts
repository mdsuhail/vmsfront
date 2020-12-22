import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageConstants } from '../_common/constants/message';
import { OtpService } from './../_services/otp/otp.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';
// import { EventEmitter } from 'protractor';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  @Output() contact = new EventEmitter();
  form: FormGroup;
  formOtp: FormGroup;
  submitted = false;
  submittedOtp = false;
  showPhoneForm = true;
  showOtpForm = false;
  loaderSpinnerMessage: String;
  currentCompany: any = {};

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private otpService: OtpService,
    public spinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private _location: Location
  ) { }

  ngOnInit() {
    this.currentCompany = JSON.parse(localStorage.getItem('company'));
    this.form = this.formBuilder.group({
      contact: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.formOtp = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  contactEvent() {
    this.contact.emit(this.form.value.contact)
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  // convenience getter for easy access to form fields
  get g() { return this.formOtp.controls; }

  public numberEvent(key: any) {
    if (key == 'delete') {
      this.form.setValue({
        contact: this.form.value.contact.slice(0, -1)
      });
    } else if (key == 'go') {
      this.sendOtp();
    }
    else {
      this.form.setValue({
        contact: this.form.value.contact + key
      });
    }
  }

  public otpVerificationEvent(key: any) {
    if (key == 'delete') {
      this.formOtp.setValue({
        otp: this.formOtp.value.otp.slice(0, -1)
      });
    } else if (key == 'verify') {
      this.verifyOtp();
    }
    else {
      this.formOtp.setValue({
        otp: this.formOtp.value.otp + key
      });
    }
  }

  sendOtp() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    this.loaderSpinnerMessage = MessageConstants.sendingOtpLoaderMessage;
    this.spinnerService.show();

    var data = {
      contact: this.form.value.contact,
      company: this.currentCompany ? this.currentCompany._id : '',
      companyName: this.currentCompany ? this.currentCompany.name : ''
    };
    this.otpService.send(data)
      .subscribe((res: any) => {
        this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          this.showPhoneForm = false;
          this.showOtpForm = true;
        } else if (res.success == false) {
          this.toastr.error(res.message, 'Error', { timeOut: 4000 })
        } else {
          this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 6000 })
        }
      },
        err => {
          console.log(err);
          this.spinnerService.hide();
        });
  }

  verifyOtp() {
    this.submittedOtp = true;

    // stop here if form is invalid
    if (this.formOtp.invalid) {
      return;
    }
    this.loaderSpinnerMessage = MessageConstants.verifyOtpLoaderMessage;
    this.spinnerService.show();

    var data = {
      otp: this.formOtp.value.otp,
      contact: this.form.value.contact,
      company: this.currentCompany ? this.currentCompany._id : '',
    };
    this.otpService.verify(data)
      .subscribe((res: any) => {
        this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          // localStorage.setItem('contact', this.form.value.contact);
          // this.router.navigate(['profile']);
          this.contactEvent()
        } else if (res.success == false) {
          this.toastr.error((res.message ? res.message : MessageConstants.serverError), 'Error', { timeOut: 3000 })
        } else {
          this.toastr.error((res.message ? res.message : MessageConstants.serverError), 'Error', { timeOut: 4000 })
        }
      },
        err => {
          console.log(err);
          this.spinnerService.hide();
          this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 6000 })
        });
  }

  backClicked() {
    this._location.back();
  }
}
