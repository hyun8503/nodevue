import ReCAPTCHA from "react-google-recaptcha";
import React from "react";
import {withSnackbar} from "notistack";
import {withRouter} from "react-router-dom";
import {withStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";

import {Avatar, Button, CircularProgress, Container, TextField, Typography} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";

import * as store from "../stores/AuthStore";
import Grid from "@material-ui/core/Grid";

import KEY from "../config/key.json";

const style = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: `calc(100vh - ${theme.footerHeight}px - 64px - ${theme.spacing(8)}px)`
    },
    lockOpenAvatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    lockOutAvatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
});

@inject('authStore')
@observer
class SignIn extends React.Component {
    constructor(props) {
        super(props);

        this.recaptchaRef = React.createRef();
    }

    handleChangeId = (e) => {
        this.props.authStore.changeLoginId(e.target.value);
    }

    handleChangePassword = (e) => {
        this.props.authStore.changeLoginPassword(e.target.value);
    }

    handleKeyUpPassword = (e) => {
        if(e.keyCode === 13 && !this.props.authStore.loginBtnDisabled) {
            this.props.authStore.doLogin(this.props.history);
        }
    }

    handleSubmitForm = (e) => {
        this.props.authStore.doLogin(this.props.history);
    }

    onSubmit = () => this.props.onSubmit(this.recaptchaRef.getValue())

    render() {
        const { classes } = this.props;
        const { loginState, login } = this.props.authStore;


        return (
            <Container component="main" maxWidth="xs">
                <div className={classes.appBarSpacer} />
                    <div className={classes.paper}>
                        <Avatar className={classes.lockOutAvatar}><LockOutlinedIcon/></Avatar>
                        <Typography component="h1" variant="h5">
                            {loginState === store.State.Failed ? 'Sign in failed.' : 'Please sign in.'}
                        </Typography>
                        <div className={classes.form}>
                            <TextField id="id"
                                       name="id"
                                       label="账号"
                                       variant="outlined"
                                       margin="normal"
                                       value={login.id}
                                       onChange={this.handleChangeId}
                                       required fullWidth />
                            <TextField id="password"
                                       name="password"
                                       label="密码"
                                       type="password"
                                       variant="outlined"
                                       margin="normal"
                                       value={login.password}
                                       onChange={this.handleChangePassword}
                                       onKeyUp={this.handleKeyUpPassword}
                                       required fullWidth />
                            <Button type="submit"
                                    className={classes.submit}
                                    color="primary"
                                    variant="contained"
                                    disabled={loginState === store.State.Pending || this.props.authStore.loginBtnDisabled}
                                    onClick={this.handleSubmitForm}
                                    fullWidth >
                                {loginState === store.State.Pending ? <CircularProgress size={22}/> : '登录'}
                            </Button>
                            <Grid container item xs={12} justify={"center"}>
                                <ReCAPTCHA
                                    ref={this.recaptchaRef}
                                    sitekey={KEY.recaptcha}
                                    onChange={(data) => this.props.authStore.recaptchaAuth(data)}
                                />
                            </Grid>
                        </div>
                    </div>
            </Container>
        );
    }
};

export default withSnackbar(withRouter(withStyles(style) (SignIn)));