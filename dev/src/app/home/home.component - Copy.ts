import { Component, OnInit, NgZone } from '@angular/core';
import { CompanyService } from './../_services/company/company.service';
import { AuthenticationService } from '@app/_services';
import { Router } from '@angular/router';
// import * as handTrack from 'handtrackjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  currentCompany: any = {};
  speechText?: any;
  modelParams = {
    flipHorizontal: true,   // flip e.g for video
    imageScaleFactor: 0.7,  // reduce input image size .
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.79,    // confidence threshold for predictions.
  }
  video: any
  canvas
  context
  model
  navigator: any
  browser: any
  compression = 5
  width = 0
  height = 0
  draw: any
  huemin = 0.0
  huemax = 0.10
  satmin = 0.0
  satmax = 1.0
  valmin = 0.4
  valmax = 1.0
  last: any
  thresh = 150
  down: any
  wasdown: any
  movethresh = 2
  brightthresh = 300
  overthresh = 1000
  avg = 0
  state = 0//States: 0 waiting for gesture, 1 waiting for next move after gesture, 2 waiting for gesture to end

  constructor(
    public router: Router,
    private companyService: CompanyService,
    private authService: AuthenticationService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    // this.reloadOnce();
    this.currentCompany = JSON.parse(localStorage.getItem('company'));
    if (!this.currentCompany) {
      this.getCompanyDetail();
    }

    // var model;
    // this.browser = <any>navigator;

    // this.browser.getUserMedia = (this.browser.getUserMedia ||
    //   this.browser.webkitGetUserMedia ||
    //   this.browser.mozGetUserMedia ||
    //   this.browser.msGetUserMedia);

    this.video = document.getElementById('video')
    this.canvas = document.getElementById('canvas')
    this.context = this.canvas.getContext('2d')

    // handTrack.startVideo(this.video).then(status => {
    //   if (status) {
    //     browser.getUserMedia({ video: {} }, stream => {
    //       this.video.srcObject = stream;
    //       // setInterval(this.runDetection, 1000);
    //       setInterval(() => { this.runDetection(); }, 500);
    //     },
    //       err => console.log(err)
    //     )
    //   }
    // })
    // this.startVideo()
    // this.loadHandTrack()
  }

  // loadHandTrack() {
  //   handTrack.load(this.modelParams).then(lmodel => {
  //     this.model = lmodel;
  //   });
  // }

  startVideo() {
    // handTrack.startVideo(this.video).then(status => {
    //   if (status) {
    //     navigator.getUserMedia({ video: {} }, stream => {
    //       this.video.srcObject = stream;
    //       setInterval(() => { this.runDetection(); }, 500);
    //     },
    //       err => console.log(err)
    //     )
    //   }
    // })

    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      this.video.srcObject = stream;
      this.video.play();
      setInterval(() => { this.dump(); }, 1000 / 25);
    });

    // this.browser.webkitGetUserMedia({ video: true }, function (stream) {
    //   video.srcObject = stream;
    //   video.play();
    //   // s=stream
    //   // video.src=window.webkitURL.createObjectURL(stream)
    //   video.addEventListener('play',
    //     function () { setInterval(this.runDetection(video), 1000 / 25) }
    //   )
    // }, function () {
    //   throw new Error('OOOOOOOH! DEEEEENIED!');
    // })
  }

  dump() {
    if (this.canvas.width != this.video.videoWidth) {
      this.width = Math.floor(this.video.videoWidth / this.compression)
      this.height = Math.floor(this.video.videoHeight / this.compression)
      this.canvas.width = this.width
      this.canvas.height = this.height
    }
    this.context.drawImage(this.video, this.width, 0, -this.width, this.height)
    this.draw = this.context.getImageData(0, 0, this.width, this.height)
    // console.log(this.draw)
    //c_.putImageData(draw,0,0)
    this.skinfilter()
    this.test()
  }

  skinfilter() {
    var skin_filter, r, g, b, a, hsv;
    skin_filter = this.context.getImageData(0, 0, this.width, this.height)
    var total_pixels = skin_filter.width * skin_filter.height
    var index_value = total_pixels * 4

    var count_data_big_array = 0;
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        index_value = x + y * this.width
        r = this.draw.data[count_data_big_array]
        g = this.draw.data[count_data_big_array + 1]
        b = this.draw.data[count_data_big_array + 2]
        a = this.draw.data[count_data_big_array + 3]

        hsv = this.rgb2Hsv(r, g, b);
        //When the hand is too lose (hsv[0] > 0.59 && hsv[0] < 1.0)
        //Skin Range on HSV values
        if (((hsv[0] > this.huemin && hsv[0] < this.huemax) || (hsv[0] > 0.59 && hsv[0] < 1.0)) && (hsv[1] > this.satmin && hsv[1] < this.satmax) && (hsv[2] > this.valmin && hsv[2] < this.valmax)) {

          skin_filter[count_data_big_array] = r
          skin_filter[count_data_big_array + 1] = g
          skin_filter[count_data_big_array + 2] = b
          skin_filter[count_data_big_array + 3] = a
        } else {
          skin_filter.data[count_data_big_array] =
            skin_filter.data[count_data_big_array + 1] =
            skin_filter.data[count_data_big_array + 2] = 0
          skin_filter.data[count_data_big_array + 3] = 0
        }

        count_data_big_array = index_value * 4;
      }
    }
    this.draw = skin_filter
  }

  rgb2Hsv(r, g, b) {
    r = r / 255
    g = g / 255
    b = b / 255

    var max = Math.max(r, g, b)
    var min = Math.min(r, g, b);

    var h, s, v = max;
    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, v];
  }

  test() {
    var delt;
    delt = this.context.createImageData(this.width, this.height)
    if (this.last) {
      var totalx = 0, totaly = 0, totald = 0, totaln = delt.width * delt.height
        , dscl = 0
        , pix = totaln * 4; while (pix -= 4) {
          var d = Math.abs(
            this.draw.data[pix] - this.last.data[pix]
          ) + Math.abs(
            this.draw.data[pix + 1] - this.last.data[pix + 1]
          ) + Math.abs(
            this.draw.data[pix + 2] - this.last.data[pix + 2]
          )
          if (d > this.thresh) {
            delt.data[pix] = 160
            delt.data[pix + 1] = 255
            delt.data[pix + 2] =
              delt.data[pix + 3] = 255
            totald += 1
            totalx += ((pix / 4) % this.width)
            totaly += (Math.floor((pix / 4) / delt.height))
          }
          else {
            delt.data[pix] =
              delt.data[pix + 1] =
              delt.data[pix + 2] = 0
            delt.data[pix + 3] = 0
          }
        }
    }
    //slide.setAttribute('style','display:initial')
    //slide.value=(totalx/totald)/width
    if (totald) {
      this.down = {
        x: totalx / totald,
        y: totaly / totald,
        d: totald
      }
      this.handledown()
    }
    //console.log(totald)
    this.last = this.draw
    // c_.putImageData(delt,0,0)
  }

  calibrate() {
    this.wasdown = {
      x: this.down.x,
      y: this.down.y,
      d: this.down.d
    }
  }

  handledown() {
    this.avg = 0.9 * this.avg + 0.1 * this.down.d
    var davg = this.down.d - this.avg, good = davg > this.brightthresh
    //console.log(davg)
    switch (this.state) {
      case 0:
        if (good) {//Found a gesture, waiting for next move
          this.state = 1
          this.calibrate()
        }
        break
      case 2://Wait for gesture to end
        if (!good) {//Gesture ended
          this.state = 0
        }
        break;
      case 1://Got next move, do something based on direction
        var dx = this.down.x - this.wasdown.x, dy = this.down.y - this.wasdown.y
        var dirx = Math.abs(dy) < Math.abs(dx)//(dx,dy) is on a bowtie
        //console.log(good,davg)
        if (dx < -this.movethresh && dirx) {
          console.log('right')
          this.router.navigate(['profile'])
          // Reveal.navigateRight()
        }
        else if (dx > this.movethresh && dirx) {
          console.log('left')
          this.router.navigate(['checkout'])
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
        this.state = 2
        break
    }
  }


  // stopVideo() {
  //   handTrack.stopVideo(this.video)
  // }

  // runDetection() {
  //   this.model.detect(this.video).then(predictions => {
  //     if (predictions.length != 0) {
  //       let hand1 = predictions[0].bbox;
  //       let x = hand1[0];
  //       let y = hand1[1];

  //       // console.log(predictions)

  //       if (x > 350) {
  //         console.log('check-in')
  //         this.stopVideo()
  //         this.ngZone.run(() =>
  //           this.router.navigate(['profile'])
  //         )
  //       }
  //       else if (x < 30 && y < 200) {
  //         console.log('check-out')
  //         this.stopVideo()
  //         this.ngZone.run(() =>
  //           this.router.navigate(['checkout'])
  //         )
  //       }

  //       console.log("x = " + x)
  //       // console.log("x = "+x + ", y = "+y)
  //     }
  //   })
  // }

  reloadOnce() {
    if (!localStorage.getItem('firstLoad')) {
      localStorage['firstLoad'] = true;
      this.refresh();
    }
    else
      localStorage.removeItem('firstLoad');
  }

  speechEventParent($event) {
    this.speechText = $event;
    console.log(this.speechText)
    this.speechEventAction()
  }

  speechEventAction() {
    if (this.speechText === 'checking' || this.speechText === 'check-in' || this.speechText === 'tekken' || this.speechText === 'chatting')
      this.router.navigate(['profile']);

    if (this.speechText === 'check out' || this.speechText === 'check-out' || this.speechText === 'checkout')
      this.router.navigate(['checkout']);
  }

  getCompanyDetail() {
    this.companyService.getCompany().subscribe((res: any) => {
      if (res.success == true && res.statusCode == 200) {
        localStorage.setItem('company', JSON.stringify(res.data.company));
      }
    })
  }

  logout() {
    this.authService.logout();
  }

  refresh(): void {
    window.location.reload();
  }

}
