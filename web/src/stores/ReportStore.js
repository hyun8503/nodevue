import {action, flow, observable} from "mobx";
import axios from "axios";
import moment from "moment";
import * as DocViewType from "../type/DocViewType";
import { saveAs } from 'file-saver';

export default class ReportStore {
    @observable reportList = [];
    @observable fileWebViewLink = null;
    @observable fileWebViewId = null;
    @observable fileWebViewLoading = false;
    @observable fileWebViewReportId = null;

    @observable fileSaving = false;
    @observable fileDownloading = false;
    
    @observable reportName = null;
    @observable selectedPlatformId = "none";
    @observable searchFileName = "";

    @observable platformList = [];

    @action initStore = () => {
        this.reportList = [];
        this.fileWebViewId = null;
        this.fileWebViewLink = null;
        this.fileWebViewLoading = false;
        this.selectedPlatformId = "none";
        this.searchFileName = "";
        this.platformList = [];
        this.fileWebViewReportId = null;
        this.fileSaving = false;
        this.fileDownloading = false;
        this.reportName = null;
    }

    @action viewExcelClose = () => {
        this.fileWebViewId = null;
        this.fileWebViewLink = null;
        this.fileWebViewLoading = false;
        this.reportName = null;
    }

    @action changeSelectedPlatformId = (value) => this.selectedPlatformId = value;
    @action changeSearchFileName = (value) => {
        value = value ? value.trim() : value;
        this.searchFileName = value
    };

    getReportList = flow(function* () {
        this.reportList = [];
        try {
            const response = yield axios.get(`/api/v1/report`, {
                params: {
                    platformId: (this.selectedPlatformId === "none" || this.selectedPlatformId === "all") ? null : this.selectedPlatformId,
                    reportName: this.searchFileName === "" ? null : this.searchFileName,
                    reportMonth: moment().format("YYYYMM"),
                }
            });
            this.reportList = response.data;
        } catch (err) {
            console.log('getReportList error');
        }
    });

    getMyPlatformList = flow(function* () {
        this.platformList = [];
        try {
            const response = yield axios.get(`/api/v1/platforms-my`);
            this.platformList = response.data;
        } catch (err) {
            console.log('getPlatformList');
            console.log(err);
            this.platformListError = true;
            this.platformList = [];
        }
    });

    viewExcelProc = flow(function* (reportId, viewType, reportName) {
        this.fileWebViewLink = null;
        this.fileWebViewId = null;
        this.fileWebViewLoading = true;
        this.reportName = reportName;

        try {
            const response = yield axios.get(`/api/v1/gapi/check-credential`);
            if(response.data.authUrl) {
                alert("将进行Google认证，关闭弹窗后再试！");
                const authUrl = response.data.authUrl.replace('&redirect_uri', '&redirect_uri=' + response.data.redirectUri);
                window.open(authUrl);
            } else {
                let response = null;
                if (viewType == DocViewType.type.Edit)
                    response = yield axios.get(`/api/v1/report/${reportId}/editviewlink`);
                else
                    response = yield axios.get(`/api/v1/report/${reportId}/webviewlink`);

                this.fileWebViewLink = response.data.webViewLink;
                this.fileWebViewId = response.data.fileId;
                this.fileWebViewReportId = reportId;
            }
            this.fileWebViewLoading = false;
        } catch (err) {
            console.log('viewExcelProc error');
            console.log(err);
            this.fileWebViewLoading = false;
        }
    });

    downloadExcel = flow(function* (reportId, reportFileName) {
        let response = null;
        this.fileDownloading = true;
        try {
            response = yield axios.get(`/api/v1/report/${reportId}/download`, { responseType: 'arraybuffer' });

            var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });

            saveAs(blob, reportFileName);

            this.fileDownloading = false;
        } catch (err) {
            console.log('downloadExcel error : ' + err);
            this.fileDownloading = false;
        }
    });

    viewExcelSave = flow(function* () {
        this.fileSaving = true;
        try {
            yield axios.put(`/api/v1/report`, {
                reportId: this.fileWebViewReportId,
                fileId: this.fileWebViewId
            });

            this.fileSaving = false;
            this.fileWebViewLink = null;
            this.fileWebViewId = null;
            this.fileWebViewReportId = null;
            this.getReportList();
        } catch (err) {
            console.log('viewExcelSaveProc error');
            this.fileSaving = false;
        }
    });
}