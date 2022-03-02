import React, { useContext } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import { Project, Stage } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useProject } from "../hooks/project";

import InteractiveList from "./InteractiveList";
import Form from "./Form";

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type ProjectTabProps = {
  handleChooseProject: (value: Project) => () => void;
  handleChooseStage: (value: Stage) => () => void;
};

const ProjectTab = ({
  handleChooseProject,
  handleChooseStage,
}: ProjectTabProps) => {
  const { env } = useContext(EnvContext);

  const {
    PROJECT_FIELDS,
    projectForm,
    handleOnNewProjectChange,
    createProjectLoading,
    handleOnCreateProject,
    handleOnDeleteProject,
    handleOnEditProject,
  } = useProject();

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
