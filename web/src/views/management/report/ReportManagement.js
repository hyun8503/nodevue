import React from "react";
import {withSnackbar} from "notistack";
import {withRouter} from "react-router-dom";
import {withStyles} from "@material-ui/core/styles";

import {Paper, Typography} from "@material-ui/core";
import SideMenu from "../../../components/SideMenu";
import Grid from "@material-ui/core/Grid";
import {inject, observer} from "mobx-react";
import moment from "moment";
import {DropzoneArea} from "material-ui-dropzone";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = theme => ({
    wrap: {
        display: 'flex',
        marginTop: '64px',
        width: '100%',
        height: '100%',
        minHeight: `calc(100vh - ${theme.footerHeight}px - 64px)`
    },
    mainContainer: {
        display: 'flex',
        paddingLeft: `calc(${theme.drawerWidth}px + ${theme.spacing(3)}px)`,
        width: '100%',
        //height: '100%',
        padding: theme.spacing(3),
    },
    appBarSpacer: theme.mixins.toolbar,
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        maxWidth: '1200px',
        width: '100%',
        //height: '100%',
        padding: theme.spacing(2),
    },
    toolbar: {
        width: '100%',
    },
    cardGrid: {
        marginTop: theme.spacing(2),
    },
    cardMedia: {
        alignItems: "center",
        backgroundSize: "contain",
        //width: '100%',
        height: '140px',
    }
});

@inject("authStore", "reportSubmitStore")
@observer
class ReportManagement extends React.Component {
    componentDidMount() {
        this.props.reportSubmitStore.getTemplateList();
    }

    componentWillUnmount() {
        this.props.reportSubmitStore.initStore();
    }

    render() {
        const { classes } = this.props;

        const renderFileWebView = () => {
            return (
                <React.Fragment>
                    <Grid item xs={12} style={{display: "flex"}}>
                        <iframe src={this.props.reportSubmitStore.fileWebViewLink ? this.props.reportSubmitStore.fileWebViewLink : ""}
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    minHeight: '700px'
                                }}
                        >
                        </iframe>
                    </Grid>
                </React.Fragment>
            );
        }

        const renderUploadView = () => {
            return (
                <React.Fragment>
                    <Grid item xs={12}>
                        {this.props.reportSubmitStore.isDropZoneAreaRender ?
                            <DropzoneArea
                                onChange={(files) => this.props.reportSubmitStore.changeUploadFileList(files)}
                                acceptedFiles={['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}
                                maxFileSize={30000000}
                                showFileNamesInPreview={true}
                                showPreviews={true}
                                showPreviewsInDropzone={false}
                                previewGridProps={{item: {xs: 2}}}
                                dropzoneText={"파일을 드래그 하거나 여기를 클릭하세요"}
                            />
                            : ""}
                    </Grid>

                    {this.props.reportSubmitStore.uploadFileList.length > 0 ?
                        <Grid container item xs={12} justify={"flex-end"} spacing={1} style={{marginTop: '8px'}}>
                            {/*<Grid item>*/}
                            {/*    <Button variant={"contained"} color={"secondary"}>취소</Button>*/}
                            {/*</Grid>*/}
                            <Grid item>
                                <Button variant={"contained"} color={"primary"} onClick={() => this.props.reportSubmitStore.uploadFiles()}>등록</Button>
                            </Grid>
                        </Grid>
                        : ""}

                    <Grid container className={classes.cardGrid} spacing={3}>
                        {this.props.reportSubmitStore.fileList.length > 0 ?
                            this.props.reportSubmitStore.fileList.map((item, index) => {
                                return (
                                    <Grid item xs={3} key={"upload-file"+index}>
                                        <Card>
                                            <CardActionArea onClick={() => this.props.reportSubmitStore.viewExcelProc(item.templateId)}>
                                                <CardMedia
                                                    className={classes.cardMedia}
                                                    image={"/images/excel.png"}
                                                    title={item.templateName}
                                                />
                                                <CardContent>
                                                    <Typography variant={"subtitle1"}>
                                                        {item.templateName}
                                                    </Typography>
                                                    <Typography variant={"body2"}>
                                                        업데이트: {moment(item.modifiedDate).format("YYYY-MM-DD")}
                                                    </Typography>
                                                </CardContent>
                                            </CardActionArea>
                                            {/*<CardActions>*/}
                                            {/*    <Button size="large" color="secondary">*/}
                                            {/*        삭제*/}
                                            {/*    </Button>*/}
                                            {/*</CardActions>*/}
                                        </Card>
                                    </Grid>
                                )
                            })
                            : ""}
                    </Grid>
                </React.Fragment>
            );
        }

        return (
            <div className={classes.wrap}>
                <Backdrop open={this.props.reportSubmitStore.fileSaving || this.props.reportSubmitStore.fileWebViewLoading || this.props.reportSubmitStore.isFileUploading}
                          style={{zIndex: 10000}}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <SideMenu
                    mobileOpen = {false}
                    setMobileOpen = {() => {}}
                    isLoggedIn = {true}
                    doLogout = {() => this.props.authStore.doLogout()}
                />
                <div className={classes.appBarSpacer} />
                <Grid className={classes.mainContainer} container justify={"center"}>
                    <Paper className={classes.mainContent}>
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography variant="h4" component="h2">
                                    보고서 템플릿 관리
                                </Typography>
                            </Grid>

                            <Grid container item xs={12} style={{marginTop: '16px'}}>
                                <Grid item xs={10}>
                                    <Typography variant="h6" gutterBottom>
                                        현재 날짜: {moment().format("YYYY-MM-DD")}
                                    </Typography>
                                </Grid>

                                <Grid item xs={2} align={"right"}>
                                    {this.props.reportSubmitStore.fileWebViewLink ?
                                        <Button variant={"contained"} color={"primary"} onClick={() => this.props.reportSubmitStore.viewExcelSave()}>저장</Button>
                                        : ""
                                    }
                                </Grid>
                            </Grid>
                            {this.props.reportSubmitStore.fileWebViewLink ? renderFileWebView() : renderUploadView()}
                        </Grid>
                    </Paper>
                </Grid>
            </div>
        );
    }
};

export default withSnackbar(withRouter(withStyles(styles) (ReportManagement)));