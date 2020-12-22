import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { WebcamImage } from 'ngx-webcam';
import { Router, UrlSerializer, ActivatedRoute } from '@angular/router';
import { MessageConstants } from '../_common/constants/message';
import { ApiConstants } from '../_common/constants/api';
import { EmployeeService } from './../_services/employee/employee.service';
import { VisitorService } from './../_services/visitor/visitor.service';
import { VisitorcategoriesService } from './../_services/visitorcategories/visitorcategories.service';
import { FaceService } from './../_services/face/face.service';
import { OtpService } from './../_services/otp/otp.service';
import * as $ from 'jquery';
import { WebsiteConstants } from '@app/_common/constants/website';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public webcamImage: WebcamImage = null;
  form: FormGroup
  submitted = false
  visitorCategory = false
  contact = false
  image = false
  profileImage = false
  governmentIdImage = false
  governmentIdImagePreview = false
  governmentIdUploadedImage
  itemImage = false
  itemImagePreview = false
  itemUploadedImage
  profile = false
  host = false
  qrcode = false
  summary = false
  options = [];
  searchedEmployee: any;
  visitorCategories: [];
  config = ApiConstants.config;
  currentCompany: any = {};
  currentBranch: any = {};
  visitorDetail: any = {};
  visitorContact = '';
  profileImagePath = '';
  govermentIdImagePath = '';
  itemImagePath = '';
  loaderSpinnerMessage: String = MessageConstants.loaderMessage;
  timeLeft: number = 8;
  interval;
  timeout;
  faceData: any = {
    Face: {
      FaceId: '',
      ImageId: ''
    }
  };
  qrCodeValue: string;
  isVisitorNew = false;
  isGovernmentIdUpload = false;
  isItemImageUpload = false;
  speechText?: any;
  onProfile = false;
  onHost = false;
  whomToMeetSpeechText = '';
  recognizeFaceService: any;
  errorCount = 0
  isFaceData = false
  public now: Date;
  showCameraButton: boolean
  todayDate = new Date().toISOString().split('T')[0]

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    public spinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private employeeService: EmployeeService,
    private visitorService: VisitorService,
    private visitorcategoriesService: VisitorcategoriesService,
    private faceService: FaceService,
    private otpService: OtpService,
    private _location: Location,
    private serializer: UrlSerializer
  ) { }

  ngOnInit() {
    // this.reloadOnce();

    //set dropdown menu key
    if (this.config) {
      this.config['displayKey'] = "name";
      this.config['placeholder'] = "Whom to meet";
    }

    //set form
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4)]],
      email: [''],
      contact: [''],
      companyFrom: [''],
      whomToMeet: ['', Validators.required],
      isLaptop: [''],
      serialNumber: [''],
      profileImage: [''],
      profileImagePath: [''],
      governmentIdUploadedImage: [''],
      governmentIdUploadedImagePath: [''],
      itemUploadedImage: [''],
      itemImageUploadedPath: [''],
      signatureImagePath: [''],
      visitorCategory: [''],
      approvalStatus: [''],
      company: [''],
      companyName: [''],
      visitorVisit: ['']
    });
    this.currentCompany = JSON.parse(localStorage.getItem('company'));
    this.currentBranch = JSON.parse(localStorage.getItem('branch'));
    this.route.queryParams.subscribe(params => {
      const access_token = params['access_token'];
      this.isVisitorNew = params['isVisitorNew'] ? params['isVisitorNew'] : false;
      this.isGovernmentIdUpload = params['isGovernmentIdUpload'] ? JSON.parse(params['isGovernmentIdUpload']) : false;
      this.isItemImageUpload = params['isItemImageUpload'] ? JSON.parse(params['isItemImageUpload']) : false;
      this.visitorContact = params['contact'] ? params['contact'] : '';
      const faceId = params['faceId'] ? params['faceId'] : '';
      const imageId = params['imageId'] ? params['imageId'] : '';
      const profileImagePath = params['profileImagePath'] ? params['profileImagePath'] : '';
      const time = params['time'] ? params['time'] : '';

      if (this.isVisitorNew) {
        // if (this.checkTime(time) == false) {
        //   this.sendToWeb()
        //   return
        // }
        this.faceData['Face']['FaceId'] = faceId
        this.faceData['Face']['ImageId'] = imageId
        this.form.patchValue({
          profileImagePath: profileImagePath
        })
        this.profileImagePath = ApiConstants.webURL + '/' + this.form.value.profileImagePath;
        this.visitorDetail = null;
        this.showSection('contact');
      } else if (this.visitorContact) {
        // if (this.checkTime(time) == false) {
        //   this.sendToWeb()
        //   return
        // }
        this.getVisitorProfile(this.visitorContact)
      } else {
        if (this.currentBranch && this.currentBranch.isTouchless !== false) {
          this.showSection('image');
          this.autoCaptureImage(4000)
        } else {
          this.showSection('contact')
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
    const access_token = localStorage.getItem('access_token');
    if (access_token)
      this.getEmployees();
  }

  checkTime(time) {
    this.now = new Date()
    if (this.now.getTime() > time)
      return false
  }

  sendToWeb() {
    this.toastr.error(MessageConstants.linkExpire, 'Error', { timeOut: 3000 })
    this.timeout = setTimeout(() => {
      window.location.replace(WebsiteConstants.websiteUrl);
    }, 3000);
  }

  reloadOnce() {
    if (!localStorage.getItem('firstLoad')) {
      localStorage['firstLoad'] = true;
      this.refresh();
    }
    else
      localStorage.removeItem('firstLoad');
  }

  createNewVisitorQrCodeUrlValue() {
    let access_token = localStorage.getItem('access_token')
    let faceId = this.faceData.Face.FaceId
    let imageId = this.faceData.Face.ImageId
    let profileImagePath = this.form.value.profileImagePath
    let host = ApiConstants.messageWebURL
    let isGovernmentIdUpload = this.currentBranch.isGovernmentIdUpload
    let isItemImageUpload = this.currentBranch.isItemImageUpload
    this.now = new Date()
    this.now.setMinutes(this.now.getMinutes() + 2);
    let queryParams = { 'access_token': access_token ? access_token : '', 'faceId': faceId ? faceId : '', 'imageId': imageId ? imageId : '', 'profileImagePath': profileImagePath ? profileImagePath : '', isVisitorNew: true, 'isGovernmentIdUpload': isGovernmentIdUpload ? isGovernmentIdUpload : false, 'isItemImageUpload': isItemImageUpload ? isItemImageUpload : false, 'time': this.now.getTime() };
    let urlTree = this.router.createUrlTree([], { queryParams });
    let url = host + urlTree
    console.log(url)
    this.createTinyUrl(url)
  }

  createOldVisitorUrlValue() {
    let access_token = localStorage.getItem('access_token')
    let visitorId = this.visitorDetail._id;
    let visitorContact = this.visitorDetail.contact;
    let isGovernmentIdUpload = this.currentBranch.isGovernmentIdUpload
    let isItemImageUpload = this.currentBranch.isItemImageUpload
    let host = ApiConstants.messageWebURL;
    this.now = new Date()
    this.now.setMinutes(this.now.getMinutes() + 2);
    let queryParams = { 'access_token': access_token ? access_token : '', 'visitorId': visitorId ? visitorId : '', 'contact': visitorContact ? visitorContact : '', 'isGovernmentIdUpload': isGovernmentIdUpload ? isGovernmentIdUpload : false, 'isItemImageUpload': isItemImageUpload ? isItemImageUpload : false, 'time': this.now.getTime() };
    let urlTree = this.router.createUrlTree([], { queryParams });
    let url = host + urlTree
    console.log(url)
    this.createTinyUrl(url)
  }

  autoCaptureImage(time) {
    this.interval = '';
    this.startTimer(time / 1000)
    // set time out in sec
    this.timeout = setTimeout(() => {
      $('#takesnapshot').trigger('click');
      if (this.currentBranch && this.currentBranch.isTouchless !== false)
        this.recognizeFace()
      else
        this.showSection('profileImage')
    }, time);
    // });
  }

  startTimer(time) {
    this.timeLeft = time
    if (this.interval)
      clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft = this.timeLeft - 1;
      } else {
        this.timeLeft = 0;
      }
    }, 1000)
  }

  setBarcodeDisableTimer(time: number) {
    var timer = time / 1000;
    this.timeout = setTimeout(() => {
      this.router.navigate(['home'])
    }, time);
    this.startTimer(timer)
  }

  recognizeFace() {
    var data = {
      "collection_name": this.currentCompany ? this.currentCompany.collectionName : ApiConstants.defaultCollectionName,
      "image": this.webcamImage ? this.webcamImage.imageAsBase64 : ''
    }
    this.recognizeFaceService = this.faceService.recognize(data)
      .subscribe((res: any) => {
        this.isFaceData = true
        if (res.success == true && res.statusCode == 200 && res.data !== null) {
          this.faceData = res.data;
          this.getVisitorByFace();
        } else {
          this.addFace()
          this.visitorDetail = null;
        }
      }, err => {
        this.checkResponse('recognizeFace')
        console.log(err);
      });
  }

  addFace() {
    var data = {
      "collection_name": this.currentCompany ? this.currentCompany.collectionName : ApiConstants.defaultCollectionName,
      "image": this.webcamImage ? this.webcamImage.imageAsBase64 : ''
    }
    this.faceService.add(data)
      .subscribe((res: any) => {
        if (res.success == true && res.statusCode == 200 && res.data !== null) {
          this.faceData = res.data;
          this.saveProfileImage()
        } else {
          this.toastr.error(MessageConstants.noFaceError, 'Error', { timeOut: 5000 })
          this.timeout = setTimeout(() => {
            this.router.navigate(['home'])
          }, 5000);
        }
      }, err => {
        this.checkResponse('addFace')
        console.log(err);
      });
  }

  createTinyUrl(longurl: string) {
    // this.spinnerService.show()
    var data = {
      "url": longurl
    }
    this.otpService.tinyUrl(data)
      .subscribe((res: any) => {
        // this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          if (this.visitorDetail !== null) {
            this.sendOtpToOldVisitor(res.data)
          }
          this.qrCodeValue = res.data
          this.setBarcodeDisableTimer(45000)
          this.showSection('qrcode');
        }
      }, err => {
        console.log(err);
        this.checkResponse('createTinyUrl', longurl)
        this.spinnerService.hide();
      });
  }

  sendOtpToOldVisitor(shorturl: string) {
    // this.spinnerService.show();
    var data = {
      shorturl: shorturl,
      contact: this.visitorDetail.contact,
      name: this.visitorDetail.name,
      company: this.currentCompany ? this.currentCompany._id : '',
      companyName: this.currentCompany ? this.currentCompany.name : ''
    };
    this.otpService.sendOldVisitor(data)
      .subscribe((res: any) => {
        // this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          this.toastr.success(MessageConstants.oldVisitorMessage, 'Success', { timeOut: 5000 })
          // setTimeout(() => {
          //   this.router.navigate(['/'])
          // }, 5000);
        } else if (res.success == false) {
          this.toastr.error(res.message, 'Error', { timeOut: 4000 })
        } else {
          this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 6000 })
        }
      },
        err => {
          console.log(err);
          this.checkResponse('sendOtpToOldVisitor', shorturl)
          this.spinnerService.hide();
        });
  }

  saveProfileImage() {
    // this.spinnerService.show()
    var data = {
      "avatar": this.webcamImage ? this.webcamImage.imageAsBase64 : ''
    }
    this.visitorService.saveProfileAvatar(data)
      .subscribe((res: any) => {
        // this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          this.form.patchValue({
            profileImagePath: res.data,
          });
          this.createNewVisitorQrCodeUrlValue()
          // console.log(res.data)
        }
      }, err => {
        console.log(err);
        this.checkResponse('saveProfileImage')
        this.spinnerService.hide();
      });
  }

  getVisitorByFace() {
    this.visitorService.getVisitorByFace(this.faceData).subscribe((res: any) => {
      if (res.success == true && res.statusCode == 200 && res.data !== null) {
        this.visitorDetail = res.data.visitor;
        this.checkVisitorCheckedin(this.visitorDetail.contact)
      } else {
        this.visitorDetail = null
        this.saveProfileImage();
      }
    }, err => {
      this.checkResponse('getVisitorByFace')
      console.log(err);
    });
  }

  contactEventParent($event) {
    this.form.patchValue({
      contact: $event,
    });
    // this.getVisitorProfile($event)
    this.checkVisitorCheckedin($event)
  }

  showSection(section: string) {
    this.visitorCategory = section === 'visitorCategory' ? true : false;
    this.contact = section === 'contact' ? true : false;
    this.image = section === 'image' ? true : false;
    this.profileImage = section === 'profileImage' ? true : false;
    this.profile = section === 'profile' ? true : false;
    this.host = section === 'host' ? true : false;
    this.summary = section === 'summary' ? true : false;
    this.qrcode = section === 'qrcode' ? true : false;
    this.governmentIdImage = section === 'governmentIdImage' ? true : false;
    this.governmentIdImagePreview = section === 'governmentIdImagePreview' ? true : false;
    this.itemImage = section === 'itemImage' ? true : false;
    this.itemImagePreview = section === 'itemImagePreview' ? true : false;
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.form.value.faceData = this.faceData;
    // this.form.value.contact = this.visitorContact;
    this.form.value.profileImage = this.webcamImage ? this.webcamImage.imageAsBase64 : '';
    this.form.value.company = this.currentCompany ? this.currentCompany._id : '';
    this.form.value.companyName = this.currentCompany ? this.currentCompany.name : '';
    this.form.value.signIn = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    this.form.value.visitorVisit = this.isVisitorNew ? 'new' : ''
    if (this.webcamImage)
      this.form.value.profileImagePath = '';
    if (this.governmentIdUploadedImage && this.governmentIdUploadedImage !== null) {
      this.form.value.governmentIdUploadedImagePath = '';
      this.form.value.governmentIdUploadedImage = this.governmentIdUploadedImage.imageAsBase64
    }
    if (this.itemUploadedImage && this.itemUploadedImage !== null) {
      this.form.value.itemImageUploadedPath = '';
      this.form.value.itemUploadedImage = this.itemUploadedImage.imageAsBase64
    }
    this.spinnerService.show();
    this.visitorService.save(this.form.value)
      .subscribe((res: any) => {
        this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          localStorage.removeItem('contact');
          this.toastr.success(res.message, 'Success', { timeOut: 4000 })
        } else if (res.success == false) {
          this.toastr.error(res.message, 'Error', { timeOut: 4000 })
        } else {
          this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 6000 })
        }
        this.timeout = setTimeout(() => {
          this.redirect('');
        }, 4000);
      }, err => {
        console.log(err);
        this.checkResponse('onSubmit')
        this.spinnerService.hide();
      });
  }

  checkout() {
    this.submitted = true;

    // stop here if form is invalid
    // if (this.form.invalid) {
    //   return;
    // }
    this.spinnerService.show();
    var data = {
      contact: this.form.value.contact ? this.form.value.contact : (this.visitorDetail.contact ? this.visitorDetail.contact : ''),
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
        });
  }

  handleImage(webcamImage: WebcamImage) {
    this.webcamImage = webcamImage;
  }

  handleGovernmentIdImage(webcamImage: WebcamImage) {
    this.governmentIdUploadedImage = webcamImage;
    console.log('governmentid')
    this.showSection('governmentIdImagePreview')
  }

  handleItemImage(webcamImage: WebcamImage) {
    this.itemUploadedImage = webcamImage;
    console.log('item image')
    this.showSection('itemImagePreview')
  }

  retakeImage() {
    this.webcamImage = null;
    this.form.value.profileImagePath = '';
    this.showSection('image')
    this.autoCaptureImage(4000)
  }

  nextToImageCapture() {
    this.showSection('image')
  }

  nextToProfile() {
    this.showSection('profile')
  }

  retakeGovernmentIdUploadedImage() {
    this.governmentIdUploadedImage = null
    this.showCameraButton = true
    this.form.value.governmentIdUploadedImagePath = ''
    this.showSection('governmentIdImage')
  }

  nextToGovernmentId() {
    if (this.isVisitorNew || this.visitorContact) {
      if (this.isItemImageUpload !== false)
        this.itemImageSection()
      else
        this.profileSection()
    } else {
      if (this.currentBranch && this.currentBranch.isItemImageUpload)
        this.itemImageSection()
      else
        this.profileSection()
    }
  }

  nextToItemImageUpload() {
    this.profileSection()
  }

  retakeItemdUploadedImage() {
    this.itemUploadedImage = null
    this.showCameraButton = true
    this.form.value.itemImageUploadedPath = ''
    this.showSection('itemImage')
  }

  nextToSummary() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    this.showSection('summary');
  }

  selectionChanged(event: any) {
    if (event.value)
      this.form.value.whomToMeet = event.value;
  }

  selectedVisitorCategory(visitorCategory: any) {
    if (visitorCategory) {
      this.form.patchValue({
        visitorCategory: visitorCategory._id
      });
      this.nextToImageCapture();
    }
  }

  // canVisitorCheckin(contact) {
  //   this.spinnerService.show();
  //   this.visitorService.checkVisitorCheckedin(contact).subscribe((res: any) => {
  //     this.spinnerService.hide();
  //     if (res.success == true && res.statusCode == 200) {

  //     }
  //   }, err => {
  //     this.spinnerService.hide();
  //     console.log(err);
  //   });
  // }

  getVisitorProfile(contact) {
    this.spinnerService.show();
    this.visitorService.getProfileByContact(contact).subscribe((res: any) => {
      this.spinnerService.hide();
      if (res.success == true && res.statusCode == 200) {
        if (res.data.visitor && res.data.visitor !== null) {
          this.visitorDetail = res.data.visitor;
          // if (this.visitorDetail && this.visitorDetail.isPreApproved && this.visitorDetail.preApprovedDate == this.todayDate) {
          //   this.checkinPreApprovedVisitor()
          //   return
          // }
          this.setDetail(res.data.visitor);
        }
        if (this.isVisitorNew || this.visitorContact) {
          if (this.isGovernmentIdUpload) {
            this.governemtIdSection()
          } else if (this.isItemImageUpload) {
            this.itemImageSection()
          } else {
            this.profileSection()
            // this.showSection('profile')
          }
        } else {
          if (this.currentBranch && this.currentBranch.isGovernmentIdUpload) {
            this.governemtIdSection()
          } else if (this.currentBranch && this.currentBranch.isItemImageUpload) {
            this.itemImageSection()
          } else {
            this.profileSection()
          }
        }
      }
    }, err => {
      this.spinnerService.hide();
      this.checkResponse('getVisitorProfile', contact);
      console.log(err);
    });
  }

  checkVisitorCheckedin(contact) {
    this.spinnerService.show();
    this.visitorService.checkVisitorCheckedin(contact)
      .subscribe((res: any) => {
        this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          if (res.data.visitor !== null)
            this.visitorDetail = res.data.visitor
          if (this.visitorDetail && this.visitorDetail.isPreApproved && this.visitorDetail.preApprovedDate == this.todayDate && this.visitorDetail.isVisitorVisited == false) {
            this.checkinPreApprovedVisitor()
            return
          }
          if (this.currentBranch && this.currentBranch.isTouchless !== false) {
            this.createOldVisitorUrlValue();
          } else {
            this.getVisitorProfile(contact);
          }
        } else if (res.success == false) {
          if (this.currentBranch && this.currentBranch.isTouchless !== false)
            this.checkout()
          else {
            this.toastr.error('You have already checked in', 'Error', { timeOut: 4000 })
            this.timeout = setTimeout(() => {
              this.redirect('');
            }, 4000);
          }
        } else {
          this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 4000 })
        }
      }, err => {
        this.spinnerService.hide();
        console.log(err);
      });
  }

  checkinPreApprovedVisitor() {
    this.spinnerService.show();
    this.visitorService.checkinPreApprovedVisitor(this.visitorDetail)
      .subscribe((res: any) => {
        this.spinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          this.toastr.success(res.message, 'Success', { timeOut: 4000 })
        } else if (res.success == false) {
          this.toastr.error(res.message, 'Error', { timeOut: 4000 })
        } else {
          this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 4000 })
        }
        this.timeout = setTimeout(() => {
          this.redirect('');
        }, 4000);
      }, err => {
        this.spinnerService.hide();
        console.log(err);
      });
  }

  profileSection() {
    if (this.form.value.profileImagePath && this.form.value.profileImagePath !== null) {
      this.showSection('profileImage')
    } else {
      this.showSection('image')
      this.autoCaptureImage(4000)
    }
  }

  governemtIdSection() {
    if (this.form.value.governmentIdUploadedImagePath && this.form.value.governmentIdUploadedImagePath !== null)
      this.showSection('governmentIdImagePreview')
    else {
      this.showCameraButton = true
      this.showSection('governmentIdImage')
    }
  }

  itemImageSection() {
    if (this.form.value.itemImageUploadedPath && this.form.value.itemImageUploadedPath !== null)
      this.showSection('itemImagePreview')
    else {
      this.showCameraButton = true
      this.showSection('itemImage')
    }
  }

  setDetail(data: any) {
    this.form.setValue({
      name: data.name,
      email: data.email,
      contact: data.contact,
      whomToMeet: '',
      companyFrom: data.companyFrom,
      isLaptop: data.isLaptop,
      serialNumber: data.serialNumber,
      profileImage: '',
      profileImagePath: data.profileImagePath ? data.profileImagePath : '',
      governmentIdUploadedImage: '',
      governmentIdUploadedImagePath: data.governmentIdUploadedImagePath ? data.governmentIdUploadedImagePath : '',
      itemUploadedImage: '',
      itemImageUploadedPath: data.itemImageUploadedPath ? data.itemImageUploadedPath : '',
      signatureImagePath: '',
      visitorCategory: '',
      approvalStatus: '',
      company: [''],
      companyName: '',
      visitorVisit: ''
    });
    this.profileImagePath = data.profileImagePath ? ApiConstants.webURL + '/' + data.profileImagePath : '';
    this.govermentIdImagePath = data.governmentIdUploadedImagePath ? ApiConstants.webURL + '/' + data.governmentIdUploadedImagePath : '';
    this.itemImagePath = data.itemImageUploadedPath ? ApiConstants.webURL + '/' + data.itemImageUploadedPath : '';
  }

  getVisitorCategories() {
    this.visitorcategoriesService.getVisitorCategories()
      .subscribe((res: any) => {
        if (res.success == true && res.statusCode == 200) {
          this.visitorCategories = res.data.visitorCategories;
          if (this.visitorCategories)
            this.updateImagePath(this.visitorCategories);
          this.checkVisitorCategoriesListLength();
        }
      }, err => {
        console.log(err);
      });
  }

  checkVisitorCategoriesListLength() {
    if (this.visitorCategories && this.visitorCategories.length)
      // this.visitorCategory = true;
      this.image = true;
    else
      this.image = true;
  }

  updateImagePath(data: []) {
    data.forEach(function (value: any) {
      if (value.backgroundImagePath) {
        value.backgroundImagePath = ApiConstants.webURL + '/' + value.backgroundImagePath;
      }
    });
  }

  getEmployees() {
    this.employeeService.getEmployees().subscribe((res: any) => {
      var employees = [];
      if (res.success == true && res.statusCode == 200) {
        employees = res.data.employees;
        if (employees.length) {
          employees.forEach(function (employee) {
            employee.name = employee.firstname + ' ' + employee.lastname + (employee.department && employee.department !== null ? ' - ' + employee.department.name : '')
          })
        }
        this.options = employees;
      }
    }, err => {
      this.checkResponse('getEmployees');
      console.log(err);
    })
  }

  backClicked() {
    this._location.back();
  }

  refresh(): void {
    window.location.reload();
  }

  redirect(redirectTo: string) {
    const access_token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = 0
    }
    if (this.interval)
      clearInterval(this.interval)
    if (!access_token || !user) {
      localStorage.removeItem('access_token')
      window.location.replace(WebsiteConstants.websiteUrl);
    }
    else
      if (redirectTo === 'back')
        this.backClicked();
      else
        this.router.navigate(['']);
  }

  interruptToHome() {
    const access_token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    this.timeout = setTimeout(() => {
      if (!access_token || !user) {
        localStorage.removeItem('access_token')
        window.location.replace(WebsiteConstants.websiteUrl);
      } else
        this.router.navigate(['home'])
    }, 3000);
  }

  checkResponse(funcName = '', param = '') {
    if (funcName === 'recognizeFace' || funcName === 'addFace')
      this.toastr.error(MessageConstants.faceResponseError, 'Error', { timeOut: 3000 })
    else
      this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
    this.interruptToHome()

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
  }

}
