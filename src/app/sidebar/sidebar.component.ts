import { Component, OnInit, AfterViewInit, AfterViewChecked, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { REST_SERVICE_ROOT, HTTP_SERVER_ROOT } from '../rest/rest.service';


declare var $: any;
//Metadata
export interface RouteInfo {
    path: string;
    title: string;
    type: string;
    icontype: string;
    // icon: string;
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    title: string;
    ab: string;
    type?: string;
}

//Menu Items

export const ROUTES: RouteInfo[] = [{
    path: '/dashboard',
    title: 'Dashboard',
    type: 'link',
    icontype: 'ti-panel',

}, {
    path: '/applications',
    title: 'Applications',
    type: 'sub',
    icontype: 'ti-package',
    children: [
    ]
}
    , {
    path: '/settings',
    title: 'Settings',
    type: 'link',
    icontype: 'ti-settings',
}
];


@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent {
    public menuItems: any[];
    public apps: string[];

    constructor(private http: HttpClient) { }


    isNotMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    }

    ngOnInit() {
        var isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;
        this.menuItems = ROUTES.filter(menuItem => menuItem);

        isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

        if (isWindows) {
            // if we are on windows OS we activate the perfectScrollbar function
            $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();
            $('html').addClass('perfect-scrollbar-on');
        } else {
            $('html').addClass('perfect-scrollbar-off');
        }


        this.http.get(REST_SERVICE_ROOT + '/getApplications').subscribe(data => {

            this.apps = [];

            //second element is the Applications. It is not safe to make static binding.
            this.menuItems[1].children = [];
            for (var i in data['applications']) {
                if (data['applications'][i] != "Console") {
                    //do not edit console app
                    console.log(data['applications'][i]);
                    this.menuItems[1].children.push({ path: data['applications'][i], title: data['applications'][i], icontype: 'ti-file' });
                    this.apps.push(data['applications'][i]);
                }
            }

        });

    }
    ngAfterViewInit() {
        var $sidebarParent = $('.sidebar .nav > li.active .collapse li.active > a').parent().parent().parent();

        var collapseId = $sidebarParent.siblings('a').attr("href");

        $(collapseId).collapse("show");
    }

}
