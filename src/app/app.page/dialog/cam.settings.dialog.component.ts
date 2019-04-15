import {Component, Inject} from '@angular/core';
import {Locale} from "../../locale/locale";
import {LiveBroadcast, RestService} from '../../rest/rest.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Endpoint, VideoServiceEndpoint,} from '../app.definitions';

declare var $: any;
declare var swal: any;

@Component({
    selector: 'dialog-overview-example-dialog',
    templateUrl: 'cam.settings.dialog.component.html',
})

export class CamSettingsDialogComponent {
    camera: LiveBroadcast;
    loadingSettings = false;
    public liveStreamEditing: LiveBroadcast;
    public shareEndpoint: boolean[];
    public videoServiceEndPoints: VideoServiceEndpoint[];
    public appName:string;
    public streamNameEmpty = false;


    constructor(
        public dialogRef: MatDialogRef<CamSettingsDialogComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.shareEndpoint = [];

        this.videoServiceEndPoints = data.videoServiceEndpoints;


        let endpointList: Endpoint[] = data.endpointList;
        this.videoServiceEndPoints.forEach((item, index) => {
            let foundService: boolean = false;
            for (var i  in endpointList) {
                if (endpointList[i].endpointServiceId == item.id) {
                    this.shareEndpoint.push(true);
                    foundService = true;
                    break;
                }
            }
            if (foundService == false) {
                this.shareEndpoint.push(false);
            }
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }


    cancelEditLiveStream(): void {
        this.dialogRef.close();
    }

    editCamSettings(isValid: boolean) {

        if (!isValid) {
            return;
        }

        console.log(this.dialogRef.componentInstance.data.status + this.dialogRef.componentInstance.data.id + this.dialogRef.componentInstance.data.name + this.dialogRef.componentInstance.data.url + this.dialogRef.componentInstance.data.username);


        this.camera = new LiveBroadcast();

        this.camera.name = this.dialogRef.componentInstance.data.name;
        this.camera.ipAddr = this.dialogRef.componentInstance.data.url;
        this.camera.username = this.dialogRef.componentInstance.data.username;
        this.camera.password = this.dialogRef.componentInstance.data.pass;
        this.camera.streamId = this.dialogRef.componentInstance.data.id;
        this.camera.status = this.dialogRef.componentInstance.data.status;
        this.camera.streamUrl = this.dialogRef.componentInstance.data.streamUrl;
        this.appName  = this.dialogRef.componentInstance.data.appName;

        if (!this.restService.checkStreamName(this.camera.name)){

            this.streamNameEmpty = true;
            return;
        }
        this.loadingSettings = true;

        var socialNetworks = [];
        this.restService.editCameraInfo(this.camera, this.dialogRef.componentInstance.data.appName, socialNetworks).subscribe(data => {

            if (data["success"]) {

                this.dialogRef.close();

                $.notify({
                    icon: "ti-save",
                    message: Locale.getLocaleInterface().broadcast_updated
                }, {
                    type: "success",
                    delay: 900,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }
            else {
                $.notify({
                    icon: "ti-alert",
                    message: Locale.getLocaleInterface().broadcast_not_updated + " " + data["message"] + " " + data["errorId"]
                }, {
                    type: "warning",
                    delay: 900,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
            }

        });



        setTimeout(()=>{

            this.restService.getCameraError(this.appName , this.camera.ipAddr ) .subscribe(data => {

                console.log("stream ID :  "+this.camera.ipAddr );

                if(data["message"] != null){

                    if (data["message"].includes("401")) {

                        swal({
                            title: "Authorization Error",
                            text: "Please Check Username and/or Password",
                            type: 'error',

                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'OK'
                        }).then(() => {


                        }).catch(function () {

                        });
                    }
                }

                else{

                    console.log("no  camera error")
                }

                this.camera.ipAddr  = "";
            });

        },5000)


    }

}