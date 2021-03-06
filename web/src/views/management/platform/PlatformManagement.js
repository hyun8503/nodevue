import React from "react";
import {withSnackbar} from "notistack";
import {withRouter} from "react-router-dom";
import {withStyles} from "@material-ui/core/styles";
import {Button, Paper, Select, TextField, Typography} from "@material-ui/core";

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';

import MaterialTable from "material-table";
import Grid from "@material-ui/core/Grid";
import SideMenu from "../../../components/SideMenu";
import {inject, observer} from "mobx-react";

import AddPlatformDialog from "./dialog/AddPlatformDialog";
import * as PlatformType from "../../../type/PlatformType";
import ConfirmDialog from "../../../components/ConfirmDialog";
import * as PermissionType from "../../../type/PermissionType";

const styles = theme => ({
    wrap: {
        display: 'flex',
        marginTop: '64px',
        width: '100%',
        height: '100%',
        minHeight: `calc(100vh - ${theme.footerHeight}px - 64px)`
    },
    mainContainer: {
        paddingLeft: `calc(${theme.drawerWidth}px + ${theme.spacing(3)}px)`,
        width: '100%',
        height: '100%',
        padding: theme.spacing(3),
        [theme.breakpoints.down('sm')]: {
            paddingLeft: theme.spacing(3)
        }
    },
    appBarSpacer: theme.mixins.toolbar,
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: theme.spacing(2),
    },
    toolbar: {
        width: '100%',
    },
    materialTable: {
        boxShadow: 'none',
        marginTop: theme.spacing(2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 100,
    },
    selectEmpty: {
        marginTop: theme.spacing(1),
    },

    button: {
        marginTop: theme.spacing(2),
        margin: theme.spacing(1),
    },
    hidden: {
        display: 'none'
    }


});



@inject("authStore", "platformStore")
@observer
class PlatformManagement extends React.Component {
    componentDidMount() {
        this.props.authStore.getMyPermission(PermissionType.type.PlatformManagement);
        this.props.platformStore.getPlatformList();
    }

    componentWillUnmount() {
        this.props.platformStore.initStore();
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.wrap}>
                <SideMenu
                    mobileOpen = {false}
                    setMobileOpen = {() => {}}
                    isLoggedIn = {true}
                    doLogout = {() => this.props.authStore.doLogout()}
                    myPermissionList = {this.props.authStore.myPermissionList}
                />
                <div className={classes.appBarSpacer} />
                <Grid className={classes.mainContainer} container justify={"center"}>
                    <Paper className={classes.mainContent}>
                        <Grid item xs={12}>
                            <Typography variant="h4" component="h2">
                                平台管理
                            </Typography>
                        </Grid>

                        <Grid container spacing={1} direction={"row"} alignItems={"center"}>
                            <Grid item xs={12} sm={12} md={4}>
                                <FormControl fullWidth variant="outlined">
                                    <Select
                                        value={this.props.platformStore.searchPlatformType}
                                        onChange={(event)=>{this.props.platformStore.changeSearchPlatformType(event.target.value)}}>
                                        <MenuItem value={PlatformType.type.None} disabled><em>平台类型</em></MenuItem>
                                        <MenuItem value={PlatformType.type.Direct}>直营</MenuItem>
                                        <MenuItem value={PlatformType.type.NonDirect}>非直营</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={12} md={5}>
                                <FormControl fullWidth
                                             noValidate
                                             autoComplete="off"
                                >
                                    <TextField
                                        id="outlined-basic"
                                        label="平台名称"
                                        variant="outlined"
                                        value={this.props.platformStore.searchName}
                                        onChange={(event) => this.props.platformStore.changeSearchName(event.target.value)}
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={12} md={3}>
                                <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => this.props.platformStore.searchPlatform()}
                                >
                                    查询
                                </Button>
                                <Button
                                    style={{marginLeft: '8px'}}
                                    variant="contained"
                                    color="primary"
                                    onClick={() => this.props.platformStore.changeIsAddPlatformDialog(true)}>
                                    新增
                                </Button>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <MaterialTable
                                style={{marginTop: '16px', boxShadow: 'none'}}
                                options={{
                                    search: false,
                                    showTitle: false,
                                    toolbar: false,
                                    actionsColumnIndex: -1,
                                    pageSize: 10,
                                    pageSizeOptions: [5, 10, 15, 20, 25, 30, 40, 50],
                                    headerStyle: {
                                        backgroundColor: '#fafafa',
                                        color: 'rgba(51, 51, 51, 0.56)',
                                        borderTop: '1px solid #eee',
                                        padding: 8,
                                    }
                                }}
                                localization={{
                                    header: {
                                        actions: '',
                                    },
                                    body: {
                                        emptyDataSourceMessage: '没有数据',
                                        editRow: { deleteText: '确定要删除吗？'}
                                    },
                                    pagination: {
                                        labelRowsSelect: '个项目',
                                        labelDisplayedRows: '总 {count}个项目中 {from} - {to}',
                                    },
                                }}
                                columns={[
                                    {title: '平台名称', field: 'platformName'},
                                    {
                                        title: '平台类型', field: 'typeCode',
                                        lookup: {[PlatformType.type.Direct]: '直营', [PlatformType.type.NonDirect]: '非直营'},
                                    },
                                ]}
                                data={
                                    !!this.props.platformStore.platformList ?
                                        this.props.platformStore.platformList.map((item) => {
                                            return {
                                                platformId: item.platformId,
                                                platformName: item.platformName,
                                                typeCode: item.typeCode,
                                            }
                                        }) : []
                                }


                                editable={{
                                    onRowUpdate: (newData, oldData) =>
                                        new Promise((resolve, reject) => {
                                                this.props.platformStore.updatePlatform(newData);
                                                resolve();
                                        }),
                                     onRowDelete: oldData =>
                                        new Promise((resolve, reject) => {
                                             this.props.platformStore.deletePlatform(oldData);
                                            resolve();
                                        }),
                                }}


                            />

                        </Grid>
                    </Paper>
                </Grid>

                <ConfirmDialog
                    open={this.props.platformStore.confirmDialogOpen}
                    handleClose={this.props.platformStore.confirmDialogClose}
                    handleConfirm={this.props.platformStore.confirmDialogHandle}
                    message={this.props.platformStore.confirmDialogMsg}
                />
                <AddPlatformDialog/>

            </div>
        );
    }
};


export default withSnackbar(withRouter(withStyles(styles) (PlatformManagement)));