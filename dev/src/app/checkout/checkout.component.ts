import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageConstants } from '../_common/constants/message';
import { VisitorService } from './../_services/visitor/visitor.service';
import { ApiConstants } from '../_common/constants/api';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';
import { WebcamImage } from 'ngx-webcam';
import { FaceService } from './../_services/face/face.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  public webcamImage: WebcamImage = null;
  form: FormGroup;
  submitted = false;
  loaderSpinnerMessage: String;
  currentCompany: any = {};
  contact = false;
  image = false;
  branchDetail: any = {};
  visitorDetail: any = {};
  timeLeft: number = 8;
  interval;
  errorCount = 0;
  timeout;
  faceData: any = {
    Face: {
      FaceId: '',
      ImageId: ''
    }
  };

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private visitorService: VisitorService,
    public spinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private _location: Location,
    private faceService: FaceService,
  ) { }

  ngOnInit(): void {
    this.currentCompany = JSON.parse(localStorage.getItem('company'));
    this.branchDetail = JSON.parse(localStorage.getItem('branch'));
    this.loaderSpinnerMessage = MessageConstants.loaderMessage;
    this.form = this.formBuilder.group({
      contact: ['', [Validators.required, Validators.minLength(10)]]
    });
    if (this.branchDetail && this.branchDetail.isTouchless && this.branchDetail.isTouchless !== undefined) {
      this.showSection('image');
      this.autoCaptureImage(4000);
    } else
      this.showSection('contact');
  }

  autoCaptureImage(time) {
    this.startTimer(time / 1000)
    // set time out in sec
    setTimeout(() => {
      $('#takesnapshot').trigger('click');
      this.recognizeFace()
    }, time);
    // });
  }

  startTimer(time) {
    this.timeLeft = time
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft = this.timeLeft - 1;
      } else {
        this.timeLeft = 0;
      }
    }, 1000)
  }

  recognizeFace() {
    var data = {
      "collection_name": this.currentCompany ? this.currentCompany.collectionName : ApiConstants.defaultCollectionName,
      "image": this.webcamImage ? this.webcamImage.imageAsBase64 : ''
    }
    this.faceService.recognize(data)
      .subscribe((res: any) => {
        if (res.success == true && res.statusCode == 200) {
          if (res.data !== null) {
            this.faceData = res.data;
            this.getVisitorByFace();
          } else {
            this.toastr.error(MessageConstants.noRelatedFaceError, 'Error', { timeOut: 5000 })
            setTimeout(() => {
              // this.showSection('contact')
              this.router.navigate(['home'])
            }, 5000);
          }
        }
      }, err => {
        this.checkResponse('recognizeFace')
        console.log(err);
      });
  }

  getVisitorByFace() {
    this.visitorService.getVisitorByFace(this.faceData).subscribe((res: any) => {
      if (res.success == true && res.statusCode == 200 && res.data !== null) {
        this.visitorDetail = res.data.visitor;
        this.form.setValue({
          contact: this.visitorDetail.contact
        });
        this.checkVisitorCheckedout(this.visitorDetail.contact);
      } else {
        this.visitorDetail = null
        this.toastr.error(MessageConstants.noRelatedFaceError, 'Error', { timeOut: 5000 })
        setTimeout(() => {
          this.router.navigate(['home'])
        }, 5000);
        // setTimeout(() => {
        //   this.showSection('contact')
        // }, 5000);
      }
    }, err => {
      this.checkResponse('getVisitorByFace')
      console.log(err);
    });
  }

  handleImage(webcamImage: WebcamImage) {
    this.webcamImage = webcamImage;
  }

  showSection(section) {
    this.contact = section === 'contact' ? true : false;
    this.image = section === 'image' ? true : false;
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  public numberEvent(key: any) {
    if (key == 'delete') {
      this.form.setValue({
        contact: this.form.value.contact.slice(0, -1)
      });
    } else if (key == 'go') {
      this.checkVisitorCheckedout(this.form.value.contact);
    } else {
      this.form.setValue({
        contact: this.form.value.contact + key
      });
    }
  }

  checkVisitorCheckedout(contact: string) {
    this.spinnerService.show();
    this.visitorService.checkVisitorCheckedout(contact)
      .subscribe((res: any) => {
        this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          this.checkout();
        } else if (res.success == false) {
          this.toastr.error('You have not check-in yet', 'Error', { timeOut: 4000 })
          this.timeout = setTimeout(() => {
            this.redirect('');
          }, 4000);
        } else {
          this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 4000 })
        }
      }, err => {
        this.spinnerService.hide();
        console.log(err);
      });
  }

  checkout() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    this.spinnerService.show();
    var data = {
      contact: this.form.value.contact,
      signOut: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      company: this.currentCompany ? this.currentCompany._id : ''
    };

    this.visitorService.checkout(data)
      .subscribe((res: any) => {
        this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          this.toastr.success(res.message, 'Success', { timeOut: 4000 })
          setTimeout(() => {
            this.router.navigate(['home'])
          }, 4000);
        } else if (res.success == false) {
          this.toastr.error((res.message ? res.message : MessageConstants.serverError), 'Error', { timeOut: 3000 })
        } else {
          this.toastr.error((res.message ? res.message : MessageConstants.serverError), 'Error', { timeOut: 4000 })
        }
      },
        err => {
          console.log(err);
          this.checkResponse('checkout')
          this.spinnerService.hide();
          // this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 6000 })
        });
  }

  redirect(redirectTo: string) {
    const access_token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (!access_token || !user)
      this.router.navigate(['login']);
    else
      if (redirectTo === 'back')
        this.backClicked();
      else
        this.router.navigate(['']);
  }

  interruptToHome() {
    // this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
    setTimeout(() => {
      this.router.navigate(['home'])
    }, 3000);
  }

  backClicked() {
    this._location.back();
  }

  checkResponse(funcName = '', param = '') {
    if (funcName === 'recognizeFace')
      this.toastr.error(MessageConstants.faceResponseError, 'Error', { timeOut: 3000 })
    else
      this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
    this.interruptToHome()
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
  }
}
