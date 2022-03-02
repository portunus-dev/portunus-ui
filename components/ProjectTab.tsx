import React, { useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import { Project } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useProject } from "../hooks/project";

import InteractiveList from "./InteractiveList";
import Form from "./Form";

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type ProjectTabProps = {
  handleChooseProject: (value: Project) => () => void;
};

const ProjectTab = ({
  handleChooseProject,
}: ProjectTabProps) => {
  const { env, setToast } = useContext(EnvContext);

  const {
    PROJECT_FIELDS,
    projectForm,
    handleOnNewProjectChange,
    createProjectLoading,
    createProjectError,
    handleOnCreateProject,
    deleteProjectLoading,
    deleteProjectError,
    handleOnDeleteProject,
    editProjectLoading,
    editProjectError,
    handleOnEditProject,
  } = useProject();

  // catch all error toast
  useEffect(() => {
    if (
      (!createProjectLoading && createProjectError) ||
      (!editProjectLoading && editProjectError) ||
      (!deleteProjectLoading && deleteProjectError)
    ) {
      setToast({ 
        content: (
          <Alert severity="error">
            {createProjectError?.message || editProjectError?.message || deleteProjectError?.message}
          </Alert>
        )}
      )
    }
  }, [
      setToast,
      createProjectLoading,
      createProjectError,
      editProjectLoading,
      editProjectError,
      deleteProjectError,
      deleteProjectLoading,
  ])

  return (
    <Grid container sx={{ p: 1 }}>
      {env.team && (
        <Grid item xs={12}>
          <InteractiveList
            subheader="Manage Projects"
            selected={env.project}
            items={env.projects.filter((o) => o.team === env.team?.key)}
            titleKey="project"
            onItemClick={handleChooseProject}
            onItemRemove={handleOnDeleteProject}
            onItemEdit={handleOnEditProject}
            confirmCount={2}
          />
          {!NEXT_PUBLIC_READ_ONLY && (
            <Box sx={{ display: "flex" }}>
              <Form
                fields={PROJECT_FIELDS}
                form={projectForm}
                onChange={handleOnNewProjectChange}
              />
              <Button
                onClick={handleOnCreateProject}
                disabled={createProjectLoading}
              >
                Add
              </Button>
            </Box>
          )}
        </Grid>
      )}
    </Grid>
  );
};

export default ProjectTab;
