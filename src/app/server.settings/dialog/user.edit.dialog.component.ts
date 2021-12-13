import { Component, Inject, OnInit } from '@angular/core';
import { Locale } from "../../locale/locale";
import { RestService, User } from '../../rest/rest.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ServerSettingsComponent} from "..//server.settings.component"

declare var $: any;
declare var swal: any;


@Component({
    selector: 'user-edit-dialog',
    templateUrl: 'user.edit.dialog.component.html',
})

export class UserEditComponent implements OnInit {

    loading = false;
    public userUpdating = false;
    public userEditing: User;
    public userNameEmpty = false;
    public currentUserType : string;
    public currentUserPermission: string;
    public allowedApp : string;
    public AdminUserType : string = "ADMIN";
    public ReadOnlyUserType : string = "READ_ONLY";
    public changePassword = false;
    public newPasswordAgain = "";
    public AllApps : string = "all";
    public applications : any;

    constructor(
        public dialogRef: MatDialogRef<UserEditComponent>, public restService: RestService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            console.debug(data.email + " - " + data.type)
            this.currentUserType = data.type;
            this.currentUserPermission = data.permission;
    }

    ngOnInit(){
        this.restService.getApplications().subscribe(data => {
            this.applications = data;
            console.log(data);
        });

    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    UserTypeChanged(event:any){

        if(event == this.AdminUserType) {
            this.currentUserType = this.AdminUserType;
        }
        if(event == this.ReadOnlyUserType) {
            this.currentUserType = this.ReadOnlyUserType;
        }
    }
    UserPermissionChanged(event:any){
        this.currentUserPermission = event;
    }

    updateUser(isValid: boolean): void {
        if (!isValid) {
            return;
        }

        this.userEditing = new User(this.dialogRef.componentInstance.data.email, "");
        
        this.userEditing.userType= this.currentUserType;
        this.userEditing.newPassword = this.dialogRef.componentInstance.data.newPassword;
        this.userEditing.allowedApp = this.currentUserPermission;
        if(this.userEditing.newPassword == undefined){
            this.userEditing.newPassword = "";
        }

        if (!this.restService.checkStreamName(this.userEditing.email)){
            this.userNameEmpty = true;
            return;
        }
        this.userUpdating = true;

        this.restService.editUser(this.userEditing
        ).subscribe(data => {
            console.log("data :" + JSON.stringify(data));
            this.userUpdating = false;

            if (data["success"]) {
                $.notify({
                    icon: "ti-save",
                    message: "User is updated"
                }, {
                    type: "success",
                    delay: 900,
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });

                this.dialogRef.close();

            }
            else {
                $.notify({
                    icon: "ti-alert",
                    message: "User is not updated: " + data["message"] + " " + data["errorId"]
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
    }



    cancelEditLiveStream(): void {
        this.dialogRef.close();
    }

}