import React from "react";
import {withStyles} from "@material-ui/core/styles";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import FormControl from "@material-ui/core/FormControl";
import {Button, Select, TextField} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {inject, observer} from "mobx-react";

import * as PlatformType from "../../../../type/PlatformType";

const styles = (theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 100,
    },
});

@inject("platformStore")
@observer
class AddPlatformDialog extends React.Component {
    componentDidMount() {
        
    }

    render() {
        const {classes} = this.props;

        return (
            <Dialog 
                open={this.props.platformStore.isAddPlatformDialog} 
                onClose={() => this.props.platformStore.changeIsAddPlatformDialog(false)}
                disableBackdropClick={false}
                disableEscapeKeyDown={false}
            >
                <DialogTitle>新增平台</DialogTitle>
                <DialogContent>
                    <FormControl variant="outlined" className={classes.formControl}>
                        <Select
                            value={this.props.platformStore.addSelectedPlatformType}
                            onChange={(event) => this.props.platformStore.changeSelectedPlatformType(event.target.value)}>
                            <MenuItem value="none" disabled>
                                <em>平台类型</em>
                            </MenuItem>
                            <MenuItem value={PlatformType.type.Direct}>直营</MenuItem>
                            <MenuItem value={PlatformType.type.NonDirect}>非直营</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl className={classes.formControl} noValidate autoComplete="off">
                        <TextField
                            id="outlined-basic"
                            label="平台名称"
                            variant="outlined"
                            value={this.props.platformStore.addPlatformName}
                            onChange={(event) => this.props.platformStore.changeAddPlatformName(event.target.value)}
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" disabled={!this.props.platformStore.addPlatformName || this.props.platformStore.addingPlatform} onClick={() => this.props.platformStore.addPlatform()}>新增</Button>
                    <Button variant="outlined"
                            color="primary"
                            onClick={() => this.props.platformStore.changeIsAddPlatformDialog(false)}
                    >
                        关闭
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default withStyles(styles)(AddPlatformDialog);
