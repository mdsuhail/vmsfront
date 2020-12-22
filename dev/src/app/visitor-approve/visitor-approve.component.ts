import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';
import { MessageConstants } from '../_common/constants/message';
import { WebsiteConstants } from '../_common/constants/website';
import { VisitorService } from './../_services/visitor/visitor.service';
import { ApiConstants } from '@app/_common/constants/api';

@Component({
  selector: 'app-visitor-approve',
  templateUrl: './visitor-approve.component.html',
  styleUrls: ['./visitor-approve.component.css']
})
export class VisitorApproveComponent implements OnInit {

  data: any = {};
  isData: Boolean = false;
  noData: Boolean;
  params: any = {};
  visitorId: String;
  loaderSpinnerMessage: String;
  timeout;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public SpinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private visitorService: VisitorService
  ) { }

  ngOnInit(): void {
    this.loaderSpinnerMessage = MessageConstants.loaderMessage;
    this.route.queryParams.subscribe(params => {
      this.params = {
        company: params['company'] && params['company'] !== null ? params['company'] : '',
        branch: params['branch'] && params['branch'] !== null ? params['branch'] : '',
        prefix: params['prefix'] && params['prefix'] !== null ? params['prefix'] : '',
      }
      this.visitorId = params['vid'];
      if (this.visitorId && this.visitorId != undefined)
        this.getVisitor(this.visitorId, this.params);

    });
    // this.route.params.subscribe(params => {
    //   // this.visitorId = params['id'];
    //   this.visitorId = '5f3b894850d9aa5d77ae1efb';
    //   console.log(this.visitorId)
    //   if (this.visitorId && this.visitorId != undefined)
    //     this.getVisitor(this.visitorId, this.params);
    // });
  }

  // Visitor detail
  getVisitor(id: any, params?: any) {
    this.SpinnerService.show();
    this.visitorService.getVisitor(id, params)
      .subscribe((res: any) => {
        this.SpinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          if (res.data.visitor && res.data.visitor !== null) {
            this.data = res.data.visitor;
            this.data.profileImagePath = this.data.profileImagePath && this.data.profileImagePath !== null ? ApiConstants.webURL + '/' + this.data.profileImagePath : WebsiteConstants.personsLogo;
            this.data.governmentIdUploadedImagePath = this.data.governmentIdUploadedImagePath && this.data.governmentIdUploadedImagePath !== null ? ApiConstants.webURL + '/' + this.data.governmentIdUploadedImagePath : '';
            this.data.itemImageUploadedPath = this.data.itemImageUploadedPath && this.data.itemImageUploadedPath !== null ? ApiConstants.webURL + '/' + this.data.itemImageUploadedPath : '';
            this.isData = true
          } else
            this.noData = true
        }
      }, err => {
        console.log(err);
        this.SpinnerService.hide();
      });
  }

  //visitor approve or disapprove
  approvalStatus(status: any) {
    this.data['approvalStatus'] = status;
    this.SpinnerService.show();
    this.visitorService.approvalStatus(this.visitorId, this.data, this.params)
      .subscribe((res: any) => {
        this.SpinnerService.hide();
        if (res.success == true && res.statusCode == 200) {
          this.toastr.success(res.message, 'Success', { timeOut: 4000 })
        } else if (res.success == false) {
          this.toastr.error(res.message, 'Error', { timeOut: 4000 })
        } else {
          this.toastr.error(MessageConstants.serverError, 'Error', { timeOut: 6000 })
        }
        this.sendToWeb()
      }, err => {
        console.log(err);
        this.SpinnerService.hide();
        this.toastr.error(MessageConstants.responseError, 'Error', { timeOut: 3000 })
        this.sendToWeb()
      });
  }

  sendToWeb() {
    this.timeout = setTimeout(() => {
      window.location.replace(WebsiteConstants.websiteUrl);
    }, 4000);
  }

}
