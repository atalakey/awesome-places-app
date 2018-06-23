import { Component } from '@angular/core';
import { IonicPage, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { NgForm } from '@angular/forms';

import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, Entry, FileError } from '@ionic-native/file';

import { SetLocationPage } from '../set-location/set-location';
import { PlacesService } from '../../services/places';
import { Location } from '../../models/location';

// declare var cordova: any;

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
  imageUrl: string = '';

  constructor(private modalCtrl: ModalController,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private geolocation: Geolocation,
              private camera: Camera,
              private file: File,
              private placesService: PlacesService) {}

  onSubmit(form: NgForm) {
    console.log(form.value);
    this.placesService.addPlace(form.value.title, form.value.description, this.location, this.imageUrl);
    form.reset();

    this.location = {
      lat:40.7624324,
      lng: -73.9759827
    };
    this.imageUrl = '';
    this.locationIsSet = false;
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
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    };
    
    this.camera.getPicture(options)
      .then((imageData) => {
        console.log(imageData);

        const fileName = imageData.replace(/^.*[\\\/]/, '');
        const path = imageData.replace(/[^\/]*$/, '');
        this.file.moveFile(path, fileName, /*cordova.file.dataDirectory*/ this.file.dataDirectory, fileName)
          .then((data: Entry) => {
            this.imageUrl = data.nativeURL;
            this.camera.cleanup();
            // this.file.removeFile(path, fileName);
          })
          .catch((error: FileError) => {
            this.imageUrl = '';
            const toast = this.toastCtrl.create({
              message: 'Could not save the image. Please try again',
              duration: 2500
            });
            toast.present();
            this.camera.cleanup();
          });

        this.imageUrl = imageData;
      })
      .catch((error) => {
        const toast = this.toastCtrl.create({
          message: 'Could not take the image. Please try again',
          duration: 2500
        });
        toast.present();
      });
  }
}
