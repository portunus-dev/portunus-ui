import React, { useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { apiRequest } from "../utils/api";
import { Team, Project, Stage } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useStage } from "../hooks/stage";
import { useRequest } from "../hooks/utils";

import KVEditor from "./kv-editor";
import InteractiveList from "./InteractiveList";
import Form from "./Form";

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type StageTabProps = {
  handleChooseStage: (value: Stage) => () => void;
};

const fetchVarData = async ({
  team,
  project,
  stage,
}: {
  team: Team;
  project: Project;
  stage: Stage;
}) => {
  const res = await apiRequest(
    `env?team=${team.key}&project=${project.project}&stage=${stage.stage}`,
    { method: "GET" }
  );
  const vars = res;
  return vars;
};

export default ({ handleChooseStage }: StageTabProps) => {
  const { env } = useContext(EnvContext);

  const {
    STAGE_FIELDS,
    handleOnDeleteStage,
    stageForm,
    handleOnNewStageChange,
    handleOnCreateStage,
    createStageLoading,
  } = useStage();

  const {
    data: varData,
    loading: varLoading,
    error: varError,
    executeRequest: varExecuteRequest,
  } = useRequest<any>({
    requestPromise: fetchVarData,
  });

  useEffect(() => {
    // though it depends on these 3, only refetch when stage changes
    if (env.team && env.project && env.stage) {
      varExecuteRequest(env);
    }
  }, [env.stage]);

  return (
    <Grid container spacing={1} sx={{ p: 3 }}>
      {env.team && env.project && (
        <Grid item xs={12} md={4}>
          <InteractiveList
            subheader="Manage Stages"
            selected={env.stage}
            items={env.stages.filter((o) => o.project === env.project?.key)}
            titleKey="stage"
            onItemClick={handleChooseStage}
            // onItemEdit={handleOnEditStage}
            onItemRemove={handleOnDeleteStage}
            confirmCount={0}
          />
          {!NEXT_PUBLIC_READ_ONLY && (
            <Box sx={{ display: "flex" }}>
              <Form
                fields={STAGE_FIELDS}
                form={stageForm}
                onChange={handleOnNewStageChange}
              />
              <Button
                onClick={handleOnCreateStage}
                disabled={createStageLoading}
              >
                Add
              </Button>
            </Box>
          )}
        </Grid>
      )}

      <Grid item xs={12} md={8}>
        {env.team && env.project && env.stage ? (
          <React.Fragment>
            <h2>Current Stage: {env.stage.stage}</h2>
            {varLoading && <CircularProgress />}
            {!varLoading && varError && varError.message}
            {!varLoading && !varError && varData && (
              <KVEditor initialKV={varData.vars} env={env} />
            )}
          </React.Fragment>
        ) : (
          <h2>Choose a stage</h2>
        )}
      </Grid>
    </Grid>
  );
};
