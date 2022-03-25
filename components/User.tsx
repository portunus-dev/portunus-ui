import React, { useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";

import AuditHistoryList from "./AuditHistoryList";
import { EnvContext } from "../hooks/env-context";
import { useUser } from "../hooks/user";

const User = () => {
  const { setToast } = useContext(EnvContext);
  const {
    user,
    userDataLoading,
    userDataError,
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
      (!editUserAuditLoading && editUserAuditError) ||
      (!userAuditLoading && userAuditError)
    ) {
      setToast({
        content: (
          <Alert severity="error">
            {userDataError?.message ||
              editUserAuditError?.message ||
              userAuditError?.message}
          </Alert>
        ),
      });
    }
  }, [
    setToast,
    userDataLoading,
    userDataError,
    editUserAuditLoading,
    editUserAuditError,
    userAuditLoading,
    userAuditError,
  ]);

  const handleOnUserAuditToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleOnEditUserAudit(e.target.checked ? "true" : "false");
  };

  return (
    <Grid container sx={{ p: 1 }}>
      {user && (
        <Grid item xs={12}>
          {user.email}
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
        </Grid>
      )}
      <Grid item xs={12}>
        {(userDataLoading || editUserAuditLoading || userAuditLoading) && (
          <CircularProgress />
        )}
      </Grid>
    </Grid>
  );
};

export default User;
