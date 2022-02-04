import React, { useMemo, useContext, useCallback, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { apiRequest } from "../utils/api";
import { Stage } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useForm, Field, useRequest } from "../hooks/utils";

import KVEditor from "./kv-editor";
import InteractiveList from "./InteractiveList";
import Form from "./Form";

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type StageTabProps = {
  handleChooseStage: (value: Stage) => () => void;
};

export default ({ handleChooseStage }: StageTabProps) => {
  const { env, dispatch } = useContext(EnvContext);

  const fetchVarData = useCallback(async ({ team, project, stage }) => {
    const res = await apiRequest(
      `env?team=${team.key}&project=${project.project}&stage=${stage.stage}`,
      { method: "GET" }
    );
    const vars = res;
    return vars;
  }, []);

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

  const STAGE_FIELDS: Field[] = useMemo(
    () => [
      {
        key: "name",
        label: "Stage Name",
        validation: "name",
        materialProps: { variant: "standard", required: true },
      },
    ],
    []
  );

  const {
    form: stageForm,
    getFormAsObject: getStageObject,
    dispatch: stageDispatch,
  } = useForm(STAGE_FIELDS);

  const stageOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    stageDispatch({ type: e.target.id, payload: e.target.value });
  };

  const createNewStage = useCallback(async () => {
    if (env.team && env.project) {
      const { key, stage } = await apiRequest("/stage", {
        method: "POST",
        body: JSON.stringify({
          team: env.team.key,
          project: env.project.project,
          ...getStageObject(),
        }),
      });
      return { key, stage, team: env.team.key, project: env.project.key };
    }
  }, [env.team, env.project, getStageObject]);

  const {
    data: createStageData,
    loading: createStageLoading,
    error: createStageError,
    executeRequest: createStageExecuteRequest,
  } = useRequest<any>({
    requestPromise: createNewStage,
  });

  const handleOnCreateStage = () => createStageExecuteRequest();

  useEffect(() => {
    if (createStageData && createStageData.key && !createStageError) {
      dispatch({ type: "addStage", payload: createStageData });
    }
  }, [createStageData, createStageError]);

  const deleteStage = useCallback(async (stage: Stage) => {
    const { key, name } = await apiRequest("/stage", {
      method: "DELETE",
      body: JSON.stringify({ stage: stage.key }),
    });
    return { key, name };
  }, []);

  const {
    data: deleteStageData,
    loading: deleteStageLoading,
    error: deleteStageError,
    executeRequest: deleteStageExecuteRequest,
  } = useRequest<any>({
    requestPromise: deleteStage,
  });

  const handleOnDeleteStage = (stage: Stage) =>
    deleteStageExecuteRequest(stage);

  useEffect(() => {
    if (deleteStageData) {
      dispatch({ type: "deleteStage", payload: deleteStageData });
    }
  }, [deleteStageData]);

  // const editStage = useCallback(async ({ name, stage }) => {
  //   await apiRequest("/stage", {
  //     method: "PUT",
  //     body: JSON.stringify({ stage: stage.key, name }),
  //   });
  //   return { key: stage.key, name };
  // }, []);

  // const {
  //   data: editStageData,
  //   loading: editStageLoading,
  //   error: editStageError,
  //   executeRequest: editStageExecuteRequest,
  // } = useRequest<any>({
  //   requestPromise: editStage,
  // });

  // const handleOnEditStage = (newName: string, stage: Stage) =>
  //   editStageExecuteRequest({ name: newName, stage });

  // useEffect(() => {
  //   if (editStageData) {
  //     dispatch({ type: "editStage", payload: editStageData });
  //   }
  // }, [editStageData]);

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
                onChange={stageOnChange}
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
