import {action, flow, observable} from "mobx";
import axios from "axios";

export default class ReportSubmitStore {
    @observable uploadFileList = [];
    @observable fileList = [];
    @observable isDropZoneAreaRender = true;
    @observable isFileUploading = false;

    @observable fileWebViewLink = null;
    @observable fileWebViewId = null;
    @observable fileWebViewTemplateId = null;
    @observable fileWebViewLoading = false;

    @observable fileSaving = false;

    @action initStore = () => {
        this.uploadFileList = [];
        this.fileList = [];
        this.isDropZoneAreaRender = true;
        this.fileWebViewLink = null;
        this.fileWebViewId = null;
        this.fileSaving = false;
        this.fileWebViewTemplateId = null;
        this.fileWebViewLoading = false;
        this.isFileUploading = false;
    }

    @action changeIsDropZoneAreaRender = (value) => this.isDropZoneAreaRender = value;
    @action changeUploadFileList = (files) => this.uploadFileList = files;

    @action addFileList = () => {
        this.fileList = this.fileList.concat(this.uploadFileList);
        this.uploadFileList = [];

        this.changeIsDropZoneAreaRender(false);
        setTimeout(() => this.changeIsDropZoneAreaRender(true), 500);
    }

    @action changeIsCardListRender = (value) => {
        this.isCardListRender = value
    };

    uploadFiles = flow(function* () {
        this.isFileUploading = true;
        try {
            if(this.uploadFileList.length == 0) {
                return null;
            }

            const formData = new FormData();
            this.uploadFileList.forEach((item) => {
                formData.append("files", item);
            });

            yield axios.post(`/api/v1/report/template`, formData);
            this.uploadFileList = [];
            this.changeIsDropZoneAreaRender(false);
            setTimeout(() => this.changeIsDropZoneAreaRender(true), 500);
            this.isFileUploading = false;
            this.getTemplateList();
        } catch (err) {
            console.log('uploadFiles error');
            console.log(err);
            this.isFileUploading = false;
        }
    });

    getTemplateList = flow(function* () {
        this.fileList = [];
        try {
            const response = yield axios.get(`/api/v1/report/template`);
            this.fileList = response.data;
        } catch (err) {
            console.log('getTemplateList error');
            console.log(err);
        }
    });

    viewExcelProc = flow(function* (templateId) {
        this.fileWebViewLink = null;
        this.fileWebViewId = null;
        this.fileWebViewLoading = true;
        try {
            const response = yield axios.get(`/api/v1/gapi/check-credential`);
            if(response.data.authUrl) {
                alert("구글 인증이 진행됩니다. 팝업창이 닫히면 다시 실행해 주세요");
                const authUrl = response.data.authUrl.replace('&redirect_uri', '&redirect_uri=' + response.data.redirectUri);
                window.open(authUrl);
            } else {
                const response = yield axios.get(`/api/v1/report/template/${templateId}`);
                this.fileWebViewTemplateId = templateId;
                this.fileWebViewLink = response.data.webViewLink;
                this.fileWebViewId = response.data.fileId;
            }
            this.fileWebViewLoading = false;
        } catch (err) {
            console.log('viewExcelProc error');
            console.log(err);
            this.fileWebViewLoading = false;
        }
    });

    viewExcelSave = flow(function* () {
        this.fileSaving = true;
        console.log(this.fileWebViewTemplateId);
        console.log(this.fileWebViewId);
        try {
            yield axios.put(`/api/v1/report/template`, {
                templateId: this.fileWebViewTemplateId,
                fileId: this.fileWebViewId
            });

            this.fileSaving = false;
            this.fileWebViewTemplateId = null;
            this.fileWebViewLink = null;
            this.fileWebViewId = null;
        } catch (err) {
            console.log('viewExcelSaveProc error');
            this.fileSaving = false;
        }
    });
}