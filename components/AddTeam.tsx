import React, { useContext, useEffect } from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import { EnvContext } from "../hooks/env-context";
import { useTeam } from "../hooks/team";

import Form from "./Form";

const AddTeam = () => {
  const { setToast, closeCreateModal } = useContext(EnvContext);

  const {
    TEAM_FIELDS,
    teamForm,
    handleOnNewTeamChange,
    createTeamData,
    createTeamLoading,
    createTeamError,
    handleOnCreateTeam,
  } = useTeam();

  // catch all error toast
  useEffect(() => {
    if (!createTeamLoading && createTeamError) {
      setToast({
        content: <Alert severity="error">{createTeamError.message}</Alert>,
      });
    }
    if (!createTeamLoading && !createTeamError && createTeamData) {
      closeCreateModal();
    }
  }, [setToast, createTeamLoading, createTeamError]);

  return (
    <Grid container sx={{ p: 1 }}>
      <Form
        fields={TEAM_FIELDS}
        form={teamForm}
        onChange={handleOnNewTeamChange}
      />
      <Button onClick={handleOnCreateTeam} disabled={createTeamLoading}>
        Add
      </Button>
    </Grid>
  );
};

export default AddTeam;
