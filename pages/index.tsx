import React, { useEffect, useState, useCallback } from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";

import CircularProgress from "@mui/material/CircularProgress";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Modal from "@mui/material/Modal";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import SettingsIcon from "@mui/icons-material/Settings";

import { apiRequest } from "../utils/api";
import {
  ArrayEntity,
  Team,
  Project,
  Stage,
  EnvOption,
  Toast,
} from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useEnv } from "../hooks/env";
import { useRequest } from "../hooks/utils";

import TeamDropdown from "../components/TeamDropdown";
import ProjectDropdown from "../components/ProjectDropdown";
import TabPanel from "../components/TabPanel";
import StageTab from "../components/StageTab";
import TeamAdminTab from "../components/TeamAdminTab";

import AddTeam from "../components/AddTeam";
import AddProject from "../components/AddProject";
import AddStage from "../components/AddStage";

import User from "../components/User";

const INDENT = {
  team: 1,
  project: 3,
  stage: 5,
};

const TOAST_DEFAULT: Toast = {
  content: undefined,
  action: undefined,
  duration: 3000,
};

const fetchAllData = async () => {
  const res = await apiRequest("all", { method: "GET" });
  const allData: ArrayEntity = res;
  return allData;
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  overflow: "hidden",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function EnvRoot() {
  const { data, loading, error, executeRequest } = useRequest<ArrayEntity>({
    requestPromise: fetchAllData,
  });

  useEffect(() => {
    executeRequest();
  }, []);

  const { env, options, dispatch } = useEnv(data);

  const handleChoose = (key: string, value: string) =>
    dispatch({ type: "chooseOption", payload: { key, value } });

  const handleChooseTeam = (value: Team) => handleChoose("team", value.key);

  const handleChooseProject = (value: Project) =>
    handleChoose("project", value.key);

  const handleChooseStage = (value: Stage) => handleChoose("stage", value.key);

  const handleOnQuickSwitch = (e: React.SyntheticEvent, newValue: any) => {
    // need to pull the correct values!
    if (newValue) handleChoose(newValue.type, newValue.key);
  };

  /*
    TODO
    - admin hide/show
    - unify api responses & Team/Project/Stage e.g. stage .project is project key, but response .project above is name
    - loading state (e.g. disable)
    - error messages
    - get state from URL
    - console errors
    - stop polluting env state with options (i.e. we had path, label & desc)
  */

  // TODO: move this to _app and AppContext so that it's app-wide
  const [open, setOpen] = useState(false);
  const handleOnClose = () => setOpen(false);
  const [toast, setToastContent] = useState(TOAST_DEFAULT);
  const setToast = useCallback((toast: Toast) => {
    setToastContent(toast);
    setOpen(true);
  }, []);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalType, setModalType] = useState("");

  const closeCreateModal = () => setModalOpen(false);
  const handleModalClose = () => closeCreateModal();

  const openCreateModal = (type: string) => {
    setModalOpen(true);
    setModalType(type);
  };

  const [tab, setTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
    setTab(newTab);
  };

  const handleOnOpenModal = (type: string) => () => openCreateModal(type);

  return (
    <EnvContext.Provider
      value={{ env, dispatch, setToast, openCreateModal, closeCreateModal }}
    >
      {loading && (
        <Box sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && (
        <Box>
          <Typography>{error.message}</Typography>
        </Box>
      )}
      {!loading && !error && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ p: 1 }}>
            <Autocomplete
              id="grouped-demo"
              options={options}
              renderOption={(props: object, option: EnvOption) => {
                return (
                  <div
                    {...props}
                    key={option.key}
                    style={{
                      paddingLeft: `${INDENT[option.type] * 5}px`,
                    }}
                  >
                    <small>{option.path}</small>
                    &nbsp;
                    <strong>{option.label}</strong>
                  </div>
                );
              }}
              filterOptions={(options, { inputValue }) => {
                const lc = inputValue.toLocaleLowerCase();
                // TS only allows you to access shared properties when you spread objects and use (A | B) to catch them
                return options.filter(
                  (o) =>
                    (o && o.key.toLowerCase().indexOf(lc) >= 0) ||
                    o.path.toLowerCase().indexOf(lc) >= 0 ||
                    ((o as Team).name &&
                      (o as Team).name.toLowerCase().indexOf(lc) >= 0) ||
                    ((o as Project | Stage).team &&
                      (o as Project | Stage).team.toLowerCase().indexOf(lc) >=
                        0) ||
                    ((o as Project | Stage).project &&
                      (o as Project | Stage).project
                        .toLowerCase()
                        .indexOf(lc) >= 0) ||
                    ((o as Stage).stage &&
                      (o as Stage).stage.toLowerCase().indexOf(lc) >= 0)
                );
              }}
              onChange={handleOnQuickSwitch}
              value={null}
              clearOnBlur
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Quick Search" />
              )}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              width: { xs: "100%", md: "70%", lg: "50%" },
            }}
          >
            <IconButton size="small" onClick={handleOnOpenModal("user")}>
              <SettingsIcon />
            </IconButton>

            <TeamDropdown handleChooseTeam={handleChooseTeam} />
            <ProjectDropdown handleChooseProject={handleChooseProject} />
          </Box>
          <Box
            sx={{
              display: "flex",
              width: { xs: "100%", md: "70%", lg: "50%" },
            }}
          >
            <Tabs value={tab} onChange={handleTabChange}>
              <Tab label="Stages" />
              <Tab label="Team Admin" disabled={!env.team} />
            </Tabs>
          </Box>

          <Paper sx={{ p: 2, width: { xs: "100%", md: "70%", lg: "50%" } }}>
            <TabPanel value={tab} index={0}>
              <StageTab handleChooseStage={handleChooseStage} />
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <TeamAdminTab />
            </TabPanel>
          </Paper>
        </Box>
      )}
      <Snackbar
        open={open}
        onClose={handleOnClose}
        autoHideDuration={toast.duration || 2000}
        action={toast.action}
        message={typeof toast.content === "string" ? toast.content : null}
      >
        {typeof toast.content !== "string" ? toast.content : undefined}
      </Snackbar>
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          {modalType === "team" && <AddTeam />}
          {modalType === "project" && <AddProject />}
          {modalType === "stage" && <AddStage />}
          {modalType === "user" && <User />}
        </Box>
      </Modal>
    </EnvContext.Provider>
  );
}
