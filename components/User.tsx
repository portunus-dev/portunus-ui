import React, { useState, useCallback, useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

import DeleteIcon from "@mui/icons-material/Delete";

import AuditHistoryList from "./AuditHistoryList";
import { EnvContext } from "../hooks/env-context";
import { useUser } from "../hooks/user";
import { TextField } from "@mui/material";

const { ENABLE_AUDITING } = process.env;

const User = () => {
  const { setToast } = useContext(EnvContext);
  const {
    userData: user,
    userDataLoading,
    userDataError,

    editUserKeyLoading,
    editUserKeyError,
    handleOnEditUserKey,
    deleteUserKeyLoading,
    deleteUserKeyError,
    handleOnDeleteUserKey,

    editUserAuditLoading,
    editUserAuditError,
    handleOnEditUserAudit,
    userAuditData,
    userAuditLoading,
    userAuditError,
  } = useUser();

  // catch all error toast
  useEffect(() => {
    if (
      (!userDataLoading && userDataError) ||
      (!editUserKeyLoading && editUserKeyError) ||
      (!deleteUserKeyLoading && deleteUserKeyError) ||
      (!editUserAuditLoading && editUserAuditError) ||
      (!userAuditLoading && userAuditError)
    ) {
      setToast({
        content: (
          <Alert severity="error">
            {userDataError?.message ||
              editUserAuditError?.message ||
              userAuditError?.message ||
              editUserKeyError?.message ||
              deleteUserKeyError?.message}
          </Alert>
        ),
      });
    }
  }, [
    setToast,
    userDataLoading,
    userDataError,
    editUserKeyLoading,
    editUserKeyError,
    deleteUserKeyLoading,
    deleteUserKeyError,
    editUserAuditLoading,
    editUserAuditError,
    userAuditLoading,
    userAuditError,
  ]);

  const handleOnUserAuditToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleOnEditUserAudit(e.target.checked ? "true" : "false");
  };

  const [userKey, setUserKey] = useState("");
  const handleOnUserKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserKey(e.target.value);
  };

  const handleOnUpdateUserKey = useCallback(() => {
    handleOnEditUserKey(userKey);
  }, [userKey]);

  return (
    <Grid container sx={{ p: 1, maxHeight: "50vh" }}>
      {user && (
        <Grid item xs={12}>
          <Typography variant="h5">{user.email}</Typography>
          {user.public_key && (
            <Typography variant="body2">
              There is an uploaded public_key for your account
              <IconButton onClick={handleOnDeleteUserKey}>
                <DeleteIcon />
              </IconButton>
            </Typography>
          )}
          <FormGroup>
            <TextField
              onChange={handleOnUserKeyChange}
              label="gpg public key"
              multiline
              maxRows={4}
            />
            <Button onClick={handleOnUpdateUserKey}>Update Key</Button>
          </FormGroup>
          {ENABLE_AUDITING && (
            <React.Fragment>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={user.preferences?.audit}
                      disabled={editUserAuditLoading}
                      onChange={handleOnUserAuditToggle}
                    />
                  }
                  label="user auditing"
                />
              </FormGroup>
              {!userAuditError && userAuditData && (
                <Box>
                  {userAuditData.length === 0 && (
                    <Typography component="div" variant="body2">
                      No Audit Data Found
                    </Typography>
                  )}
                  <AuditHistoryList auditHistory={userAuditData} />
                </Box>
              )}
            </React.Fragment>
          )}
        </Grid>
      )}
      <Grid item xs={12}>
        {(userDataLoading ||
          (ENABLE_AUDITING && (editUserAuditLoading || userAuditLoading))) && (
          <CircularProgress />
        )}
      </Grid>
    </Grid>
  );
};

export default User;
