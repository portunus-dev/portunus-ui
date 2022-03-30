import React, { useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import { EnvContext } from "../hooks/env-context";
import { useStage } from "../hooks/stage";

import Form from "./Form";

const AddStage = () => {
  const { setToast, closeCreateModal } = useContext(EnvContext);

  const {
    STAGE_FIELDS,
    stageForm,
    handleOnNewStageChange,
    createStageData,
    createStageLoading,
    createStageError,
    handleOnCreateStage,
  } = useStage();

  // catch all error toast
  useEffect(() => {
    if (!createStageLoading && createStageError) {
      setToast({
        content: <Alert severity="error">{createStageError.message}</Alert>,
      });
    }
    if (!createStageLoading && !createStageError && createStageData) {
      closeCreateModal();
    }
  }, [setToast, createStageLoading, createStageError]);

  return (
    <Grid container sx={{ p: 1 }}>
      <Form
        fields={STAGE_FIELDS}
        form={stageForm}
        onChange={handleOnNewStageChange}
      />
      <Button onClick={handleOnCreateStage} disabled={createStageLoading}>
        Add
      </Button>
    </Grid>
  );
};

export default AddStage;
