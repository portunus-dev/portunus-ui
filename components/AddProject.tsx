import React, { useContext, useEffect } from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import { EnvContext } from "../hooks/env-context";
import { useProject } from "../hooks/project";

import Form from "./Form";

const AddProject = () => {
  const { setToast, closeCreateModal } = useContext(EnvContext);

  const {
    PROJECT_FIELDS,
    projectForm,
    handleOnNewProjectChange,
    createProjectData,
    createProjectLoading,
    createProjectError,
    handleOnCreateProject,
  } = useProject();

  // catch all error toast
  useEffect(() => {
    if (!createProjectLoading && createProjectError) {
      setToast({
        content: <Alert severity="error">{createProjectError.message}</Alert>,
      });
    }
    if (!createProjectLoading && !createProjectError && createProjectData) {
      closeCreateModal();
    }
  }, [setToast, createProjectLoading, createProjectError]);

  return (
    <Grid container sx={{ p: 1 }}>
      <Form
        fields={PROJECT_FIELDS}
        form={projectForm}
        onChange={handleOnNewProjectChange}
      />
      <Button onClick={handleOnCreateProject} disabled={createProjectLoading}>
        Add
      </Button>
    </Grid>
  );
};

export default AddProject;
