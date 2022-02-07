import React, { useMemo, useContext, useCallback, useEffect } from "react";

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

export default ({
  handleChooseProject,
  handleChooseStage,
}: ProjectTabProps) => {
  const { env, dispatch } = useContext(EnvContext);

  const {
    PROJECT_FIELDS,
    projectForm,
    projectOnChange,
    createProjectLoading,
    handleOnCreateProject,
    handleOnDeleteProject,
    handleOnEditProject,
  } = useProject({ envDispatch: dispatch, env });

  return (
    <Grid container spacing={1} sx={{ p: 3 }}>
      {env.team && (
        <Grid item xs={12} md={4}>
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
                onChange={projectOnChange}
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
      <Grid item xs={12} md={8}>
        {env.team && env.project ? (
          <React.Fragment>
            <h2>Current project: {env.project.project}</h2>
            <InteractiveList
              subheader="Your Stages"
              selected={env.stage}
              items={env.stages.filter((o) => o.project === env.project?.key)}
              titleKey="stage"
              onItemClick={handleChooseStage}
            />
          </React.Fragment>
        ) : (
          <h2>Choose a project</h2>
        )}
      </Grid>
    </Grid>
  );
};
