import { Component } from '@angular/core';
import { IonicPage, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { SetLocationPage } from '../set-location/set-location';
import { Location } from '../../models/location';

@IonicPage()
@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {
  location: Location = {
    lat:40.7624324,
    lng: -73.9759827
  };
  locationIsSet: boolean = false;

  constructor(private modalCtrl: ModalController,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private geolocation: Geolocation,
              private camera: Camera) {}

  onSubmit(form: NgForm) {
    console.log(form.value);
  }

  onOpenMap() {
    const modal = this.modalCtrl.create(SetLocationPage, {location: this.location, isSet: this.locationIsSet});
    modal.present();
    modal.onDidDismiss(
      data => {
        if(data) {
          this.location = data.location;
          this.locationIsSet = true;
        }
      }
    );
  }

  onLocate() {
    const loader = this.loadingCtrl.create({
      content: 'Getting your location...'
    });

    loader.present();

    this.geolocation.getCurrentPosition()
      .then((location) => {
        loader.dismiss();
        this.location.lat = location.coords.latitude;
        this.location.lng = location.coords.longitude;
        this.locationIsSet = true;
      })
      .catch((error) => {
        loader.dismiss();
        
        const toast = this.toastCtrl.create({
          message: 'Could not get location, please pick it manually',
          duration: 25000
        });

        toast.present();

        console.log('Error getting location', error);
      });
  }

  onTakePhoto() {
    const options: CameraOptions = {
      // quality: 100,
      // destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      // mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }
    
    this.camera.getPicture(options)
      .then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        // let base64Image = 'data:image/jpeg;base64,' + imageData;
        console.log(imageData);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
