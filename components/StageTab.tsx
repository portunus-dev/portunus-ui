import React, { useContext, useEffect, useState, useCallback } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";

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
  handleChooseStage: (value: Stage) => void;
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
  const { env, setToast, openCreateModal } = useContext(EnvContext);

  const {
    STAGE_FIELDS,
    stageForm,
    handleOnNewStageChange,
    createStageLoading,
    createStageError,
    handleOnCreateStage,
    deleteStageLoading,
    deleteStageError,
    onDeleteStage,
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

  const handleOnCopyPrintEnv = useCallback(
    (stage: Stage) => (e: React.MouseEvent) => {
      e.stopPropagation();
      const printEnvEntry = `PORTUNUS_TOKEN=${jwt}/${
        stage.team
      }/${stage.project.replace(`${stage.team}::`, "")}/${stage.stage}`;

      console.log("clipboard!");
      navigator.clipboard.writeText(printEnvEntry).then(() => {
        console.log("the toast!");
        setToast({ content: "Copied!", duration: 1500 });
      });
    },
    [jwt]
  );

  const handleOnDeleteStage = (stage: Stage) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteStage(stage);
  };

  // catch all error toast
  useEffect(() => {
    if (
      (!createStageLoading && createStageError) ||
      (!deleteStageLoading && deleteStageError)
    ) {
      setToast({
        content: (
          <Alert severity="error">
            {createStageError?.message || deleteStageError?.message}
          </Alert>
        ),
      });
    }
  }, [
    setToast,
    createStageLoading,
    createStageError,
    deleteStageError,
    deleteStageLoading,
  ]);

  const handleOnOpenCreateModal = () => openCreateModal("stage");

  const [expanded, setExpanded] = useState("");
  const handleOnSetExpanded = useCallback(
    (stage: Stage) => () => {
      if (expanded === stage.stage) {
        setExpanded("");
      } else {
        setExpanded(stage.stage);
        handleChooseStage(stage);
      }
    },
    [expanded]
  );

  useEffect(() => {
    if (env.stage) {
      setExpanded(env.stage.stage);
    }
  }, [env]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Box sx={{ display: "flex", width: "100%" }}>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            {!env.team && "Create a team"}
            {!env.project && "Create a project"}
            {env.team && env.project && "Project Stages"}
          </Typography>
          <Button
            onClick={handleOnOpenCreateModal}
            disabled={!env.team || !env.project}
          >
            Add Stage
          </Button>
        </Box>
      </Grid>
      {env.team && env.project && (
        <Grid item xs={12}>
          {env.stages.filter((o) => o.project === env.project?.key).length ===
            0 && <Typography variant="body2">No Stages Found</Typography>}
          {env.stages
            .filter((o) => o.project === env.project?.key)
            .map((o) => (
              <Accordion
                expanded={expanded === o.stage}
                onChange={handleOnSetExpanded(o)}
                disableGutters
                square
                elevation={0}
                sx={{
                  border: "none",
                }}
                key={o.stage}
              >
                <AccordionSummary>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" component="div">
                      {o.stage}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{ color: "text.secondary" }}
                    >
                      {o.vars} Variables
                    </Typography>
                  </Box>
                  <IconButton onClick={handleOnCopyPrintEnv(o)}>
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton onClick={handleOnDeleteStage(o)}>
                    <DeleteIcon />
                  </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                  {env.team && env.project && env.stage && (
                    <React.Fragment>
                      {varLoading && <CircularProgress />}
                      {!varLoading && varError && varError.message}
                      {!varLoading && !varError && varData && (
                        <KVEditor initialKV={varData.vars} env={env} />
                      )}
                    </React.Fragment>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
        </Grid>
      )}
    </Grid>
  );
};

export default StageTab;
