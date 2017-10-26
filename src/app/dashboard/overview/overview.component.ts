import { Component, OnInit } from '@angular/core';
//import * as Chartist from 'chartist';
import { HttpClient } from '@angular/common/http';
import { REST_SERVICE_ROOT } from '../../rest/rest.service';

import { RestService } from '../../rest/rest.service';
import { Router } from '@angular/router';


declare var $: any;
declare var Chartist: any;

declare interface AppInfo {
    name: string;
    liveStreamCount: number;
    vodCount: number;
    storage: number;
}

declare interface TableData {
    dataRows: AppInfo[];
}

@Component({
    selector: 'overview-cmp',
    templateUrl: './overview.component.html'
})

export class OverviewComponent implements OnInit {

    public cpuLoad: number;
    public liveStreamSize: number;
    public watcherSize: number;
    public chartSystemMemory: any;
    public diskUsagePercent: any;
    public memoryUsagePercent: any;
    public diskTotalSpace: any;
    public diskInUseSpace: any;
    public memoryTotalSpace: any;
    public memoryInUseSpace: any;
    public systemMemoryInUse: any;
    public systemMemoryTotal: any;

    public cpuLoadIntervalId = 0;
    public systemMemoryUsagePercent = 0;
    public appTableData: TableData;
    public units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    public timerId:any;

    constructor(private http: HttpClient, private restService:RestService, private router:Router) { }

    niceBytes(x): string {
        let l = 0, n = parseInt(x, 10) || 0;
        while (n >= 1000) {
            n = n / 1000;
            l++;
        }
        return (n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + this.units[l]);
    }

    initCirclePercentage() {
        $('#chartSystemMemory, #chartDiskUsage, #chartMemoryUsage').easyPieChart({
            lineWidth: 9,
            size: 160,
            scaleColor: false,
            trackColor: '#BBDEFB',
            barColor: '#1565C0',
            animate: false,
        });
    }

    ngOnInit() {
        this.appTableData = {
            dataRows: [
            ]
          };
    }
    ngAfterViewInit() {
        this.initCirclePercentage();
        this.updateCPULoad();
        this.getLiveClientsSize();
        this.getSystemMemoryInfo();
        this.getFileSystemInfo();
        this.getJVMMemoryInfo();
        this.getApplicationsInfo();
        this.timerId = window.setInterval(() => {
            this.updateCPULoad();
            this.getLiveClientsSize();
            this.getSystemMemoryInfo();
            this.getFileSystemInfo();
            this.getJVMMemoryInfo();
            this.getApplicationsInfo();
        }, 5000);
    }

    ngOnDestroy() {
       
        if (this.timerId) {
          clearInterval(this.timerId);
        }
      }

    updateCPULoad(): void {
        this.restService.getCPULoad().subscribe(data => {
            this.cpuLoad = Number(data["systemCPULoad"]);

            //["systemCPULoad"]
            },
            this.handleError);
    }

    handleError(error:Response) {
    
            console.log("error status: " + error.status);
            if (error.status == 401) {
                console.log(this.router);
                //this.router.navigateByUrl("/pages/login");
            }
        
    }
    
    getLiveClientsSize(): void {
        this.http.get(REST_SERVICE_ROOT + '/getLiveClientsSize').subscribe(data => {
            this.liveStreamSize = Number(data["totalLiveStreamSize"]);
            this.watcherSize = Number(data["totalConnectionSize"]) - this.liveStreamSize;
        });
    }
    
    getSystemMemoryInfo(): void {
        this.http.get(REST_SERVICE_ROOT + '/getSystemMemoryInfo').subscribe(data => {
            var freeSpace = Number(data["freeMemory"]);
            this.systemMemoryInUse = Number(data["inUseMemory"]);
            this.systemMemoryTotal  = Number(data["totalMemory"]);
            this.systemMemoryUsagePercent = Math.round(this.systemMemoryInUse * 100 / this.systemMemoryTotal);
            //TODO: open it if this chart will be used
            //$('#chartSystemMemory').data('easyPieChart').update(this.systemMemoryUsagePercent);
        });
    
    }
    
    getFileSystemInfo(): void {
        this.http.get(REST_SERVICE_ROOT + '/getFileSystemInfo').subscribe(data => {
            // Read the result field from the JSON response.
            var freeSpace = Number(data["freeSpace"]);
            this.diskInUseSpace = Number(data["inUseSpace"]);
            this.diskTotalSpace = Number(data["totalSpace"]);
            this.diskUsagePercent = Math.round(this.diskInUseSpace * 100 / this.diskTotalSpace);
    
            $("#chartDiskUsage").data('easyPieChart').update(this.diskUsagePercent);
        });
    }
    
    getJVMMemoryInfo(): void {
        this.http.get(REST_SERVICE_ROOT + '/getJVMMemoryInfo').subscribe(data => {
            this.memoryInUseSpace = Number(data["inUseMemory"]);
            this.memoryTotalSpace = Number(data["maxMemory"]);
            this.memoryUsagePercent = Math.round(Number(this.memoryInUseSpace * 100 / this.memoryTotalSpace));
    
            $("#chartMemoryUsage").data('easyPieChart').update(this.memoryUsagePercent);
        });
    }
    
    
    getApplicationsInfo(): void {
        this.http.get(REST_SERVICE_ROOT + '/getApplicationsInfo').subscribe(data => {
            this.appTableData.dataRows = [];
            for (var i in data) {
                this.appTableData.dataRows.push(data[i]);
            }
        });
    } 
}
