import React, { useContext, useEffect, useState, useCallback } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";

import { apiRequest } from "../utils/api";
import { Team, Project, Stage } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useStage } from "../hooks/stage";
import { useRequest } from "../hooks/utils";
import { useAuth } from "../hooks/auth";

import KVEditor from "./KVEditor";
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

const StageTab = ({ handleChooseStage }: StageTabProps) => {
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
    if (env.team && env.project && env.stage) {
      varExecuteRequest(env);
    }
  }, [env, varExecuteRequest]);

  const { jwt } = useAuth();

  const [open, setOpen] = useState(false)
  const handleOnClose = () => setOpen(false)
  const handleOnCopyPrintEnv = useCallback((stage: Stage) => () => {
    const printEnvEntry = `PORTUNUS_TOKEN=${jwt}/${
      stage.team
    }/${stage.project.replace(`${stage.team}::`, "")}/${stage.stage}`;
    
    navigator.clipboard.writeText(printEnvEntry).then(() => {
      setOpen(true)
    });
  }, [jwt]);

  return (
    <Grid container sx={{ p: 1 }}>
      {env.team && env.project && (
        <Grid item xs={12}>
          <InteractiveList
            subheader="Manage Stages"
            selected={env.stage}
            items={env.stages.filter((o) => o.project === env.project?.key)}
            titleKey="stage"
            onItemClick={handleChooseStage}
            itemSecondaryAction={handleOnCopyPrintEnv}
            ItemSecondaryNode={<Button>Print Env</Button>}
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
        {env.team && env.project && env.stage && (
          <React.Fragment>
            {varLoading && <CircularProgress />}
            {!varLoading && varError && varError.message}
            {!varLoading && !varError && varData && (
              <KVEditor initialKV={varData.vars} env={env} />
            )}
          </React.Fragment>
        )}
      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleOnClose}
        message="Copied!"
      />
    </Grid>
  );
};

export default StageTab;
