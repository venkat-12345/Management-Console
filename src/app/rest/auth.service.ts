import {Injectable, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {CanActivate, Router} from '@angular/router';
import {RestService, User} from './rest.service';
import {Licence} from "../server.settings/server.settings.component";
import {ServerSettings} from "../app.page/app.page.component";
import {timer} from 'rxjs/observable/timer';
import {DatePipe} from '@angular/common';
import {Subscription} from "rxjs";


declare var swal: any;


@Injectable()
export class AuthService implements CanActivate, OnInit {

    public isAuthenticated: boolean = false;

    public serverSettings: ServerSettings;

    public licenceWarningDisplay = true;

    public currentLicence : Licence = null;

    public licenceSubscription: Subscription = null;

    public  source : any ;

    public leftDays : number;

    constructor(private restService: RestService, private router: Router, private datePipe: DatePipe) {

        setInterval(() => {
            this.checkServerIsAuthenticated();


        }, 5000, );

    }

    ngOnInit() {
        console.log('ngOnInit fired');
    }


    test(): string {
        console.log("constructor in auth service");

        return 'working';

    }

    initLicenseCheck(){
        //check first after 5 seconds then each 1 minute

        this.source = timer(4000, 60000);
        this.licenceSubscription= this.source.subscribe(val => {
                if (this.isAuthenticated) {
                    if (this.serverSettings != null) {
                        this.getLicenceStatus(this.serverSettings.licenceKey);
                    } else {
                        this.getServerSettings();
                    }
                }

            }
        );




    }

    login(email: string, password: string): Observable<Object> {

        let user = new User(email, password);

        return this.restService.authenticateUser(user);
    }

    changeUserPassword(email: string, password: string, newPassword: string): Observable<Object> {
        let user = new User(email, password);
        user.newPassword = newPassword;
        return this.restService.changePassword(user);
    }

    isFirstLogin(): Observable<Object> {
        return this.restService.isFirstLogin();
    }

    createFirstAccount(user: User): Observable<Object> {
        return this.restService.createFirstAccount(user);
    }

    checkServerIsAuthenticated(): void {

        if (localStorage.getItem('authenticated')) {
            this.restService.isAuthenticated().subscribe(data => {

                    this.isAuthenticated = data["success"];
                    console.log("authenticated --> " + data["success"]);
                    if (!this.isAuthenticated) {
                        this.router.navigateByUrl('/pages/login');
                    }
                    if(this.router.url=="/pages/login"){
                        this.router.navigateByUrl('/dashboard/overview');
                    }
                },
                error => {
                    this.isAuthenticated = false;
                    this.router.navigateByUrl('/pages/login');
                });
        }
        else{
            this.isAuthenticated = false;
        }
    }

    getServerSettings (){

        this.restService.getServerSettings().subscribe(data => {
            this.serverSettings = <ServerSettings>data;

            console.log(data);

            this.getLicenceStatus(this.serverSettings.licenceKey)

        });

    }


    getLicenceStatus (key: string) : any {

        this.currentLicence = null;

        this.restService.getLicenseStatus(key).subscribe(data => {
            if (data != null) {
                this.currentLicence= <Licence>data;
                console.log(data);
                //    console.log("end date: " + this.currentLicence.endDate);

                let end =this.currentLicence.endDate;


                this.leftDays = this.differenceInDays(new Date().getTime(), new Date(end).getTime());

                console.log("Your license expires in " + this.leftDays + " days");

                if (this.leftDays <16 && this.licenceWarningDisplay){

                    swal({
                        title: "Your license expires in " + this.leftDays + " days",
                        text: "Please Renew Your License ",
                        type: 'info',

                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',

                        onClose: function () {

                        }
                    }).then(() => {


                    }).catch(function () {

                    });

                    this.licenceWarningDisplay = false;

                }

                return this.currentLicence;

            }
            else {
                console.log("invalid license")

                if(this.licenceWarningDisplay) {
                    swal({
                        title: "Invalid License",
                        text: "Please Validate Your License ",
                        type: 'error',

                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK',

                        onClose: function () {

                        }
                    }).then(() => {
                        window.location.href = "/#/serverSettings";

                    }).catch(function () {

                    });
                }
                this.licenceWarningDisplay = false;
                return null;


            }

        });

    }

    differenceInDays(firstDate: number, secondDate: number) {
        return Math.round((secondDate-firstDate)/(1000*60*60*24));
    }

    canActivate(): boolean {
        /*

        */

        if (localStorage.getItem('authenticated') && this.isAuthenticated) {

            this.restService.isAuthenticated().subscribe(data => {

                    this.isAuthenticated = data["success"];

                    if (!this.isAuthenticated) {
                        this.router.navigateByUrl('/pages/login');
                    }
                    if(this.router.url=="/pages/login"){
                        this.router.navigateByUrl('/dashboard/overview');
                    }
                },
                error => {
                    this.isAuthenticated = false;
                    this.router.navigateByUrl('/pages/login');
                });
            return true;
        }
        else {
            this.router.navigateByUrl('/pages/login');
            this.isAuthenticated = false;
            return false;
        }

    }

}
