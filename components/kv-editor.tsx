import React, { useEffect, useState, useCallback } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

// import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add";

import JSONInput from "react-json-editor-ajrm";

type KVStore = { [k: string]: string };
type onChangeListener = (event: React.ChangeEvent<HTMLInputElement>) => void;
type KVListItem = { key: string; value: string; index: number };
type KVList = KVListItem[];

type KVEditorProps = {
  initialKV: KVStore;
};

type Changes = {
  add: KVStore;
  edit: KVStore;
  remove?: string[];
};

const transformObjectToList: (o: KVStore) => KVList = (obj) =>
  Object.entries(obj).reduce((agg: KVList, [key, value], index) => {
    agg.push({ key, value, index });
    return agg;
  }, []);

const transformListToObject: (o: KVList) => KVStore = (list) =>
  list.reduce((agg: KVStore, { key, value }) => {
    agg[key] = value;
    return agg;
  }, {} as KVStore);

const calculateDelta = (initial: KVStore, current: KVList) => {
  const { add, edit }: Changes = current.reduce(
    (agg, ele) => {
      if (initial[ele.key] === undefined) {
        agg.add[ele.key] = ele.value;
      } else if (initial[ele.key] !== ele.value) {
        agg.edit[ele.key] = ele.value;
      }
      return agg;
    },
    { add: {}, edit: {} } as Changes
  );

  const remove = Object.keys(initial).filter(
    (key) => current.find((o) => o.key === key) === undefined
  );
  return { add, edit, remove };
};

const KVEditor = ({ initialKV }: KVEditorProps) => {
  const [editing, setEditing] = useState(false);
  const [jsonEdit, setJsonEdit] = useState(false);
  const [jsonInitialKV, setJsonInitialKV] = useState(initialKV);
  const [jsonWorkingKV, setJsonWorkingKV] = useState(initialKV);
  const [workingKV, setWorkingKV] = useState(transformObjectToList(initialKV));
  const [infoMessage, setInfoMessage] = useState("");
  const [changes, setChanges] = useState(null); // the delta commands for API call

  useEffect(() => {
    setWorkingKV(transformObjectToList(initialKV));
    setJsonInitialKV(initialKV);
    setChanges(null);
    setInfoMessage("");
    setEditing(false);
    setJsonEdit(false);
  }, [initialKV]);

  const handleOnKeyChange: (index: number) => onChangeListener =
    (index) => (e) =>
      setWorkingKV((o) => {
        const update = [...o];
        update[index] = {
          ...update[index],
          key: e.target.value,
        };
        return update;
      });

  useEffect(() => {
    let duplicates: string[] = [];
    for (let i = 0; i < workingKV.length - 1; i++) {
      const found = workingKV
        .slice(i + 1)
        .filter(({ key }) => key === workingKV[i].key);
      if (found.length) duplicates.push(workingKV[i].key);
    }

    if (duplicates.length > 0) {
      setInfoMessage("Duplicate key(s) found: " + duplicates);
    } else {
      setInfoMessage("");
    }

    setChanges(calculateDelta(initialKV, workingKV));
    console.log("===> USE EFFECT", workingKV);
    setJsonInitialKV(transformListToObject(workingKV));
  }, [workingKV, initialKV]);

  const handleOnValueChange: (index: number) => onChangeListener =
    (index) => (e) =>
      setWorkingKV((o) => {
        const update = [...o];
        update[index] = {
          ...update[index],
          value: e.target.value,
        };
        return update;
      });

  const handleOnKeyDelete: (index: number) => () => void = (index) => () =>
    setWorkingKV((o) => {
      const update = [...o.slice(0, index), ...o.slice(index + 1)];
      return update;
    });

  const handleOnKeyAdd: () => void = () =>
    setWorkingKV((o) => {
      const update = [
        ...o,
        {
          key: "",
          value: "",
          index: (o[o.length - 1] || { index: 0 }).index + 1,
        },
      ];
      return update;
    });

  const handleOnEditVariables = () => setEditing(true);
  const handleOnSaveVariables = () => {
    // TODO send api call and update
    setEditing(false);
  };
  const handleOnCancelEdit = () => {
    // revert changes
    setWorkingKV(transformObjectToList(initialKV));
    setEditing(false);
  };

  // ({ json, error }) => console.log(json, error)
  const [jsonError, setJsonError] = useState(false);
  const handleOnWorkingKVChange = ({ jsObject, error }) => {
    // TODO: validate nesting, arrays etc
    setJsonWorkingKV(jsObject);
    setJsonError(error === false ? false : error.reason);
  };
  const handleOnJsonToggle = useCallback(() => {
    if (!jsonError && jsonEdit) {
      setWorkingKV(transformObjectToList(jsonWorkingKV));
    }
    // TODO: the below will enforce a change to workingKV format (i.e. no nesting)
    // if (!jsonEdit) {
    //   setJsonInitialKV(transformListToObject(workingKV));
    // }
    setJsonEdit((o) => !o);
  }, [jsonEdit, jsonWorkingKV, jsonError, workingKV]);

  return (
    <Box sx={{ p: 2 }}>
      {editing ? (
        <div>
          {jsonEdit ? (
            <Box>
              <JSONInput
                placeholder={jsonInitialKV}
                onChange={handleOnWorkingKVChange}
                height="200px"
                confirmGood={false}
                theme="light_mitsuketa_tribute"
              />
            </Box>
          ) : (
            <Box>
              {workingKV.map(({ key: k, value: v, index }) => (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    mb: 1,
                  }}
                  key={index}
                >
                  <TextField value={k} onChange={handleOnKeyChange(index)} />
                  <TextField value={v} onChange={handleOnValueChange(index)} />
                  <Button onClick={handleOnKeyDelete(index)}>Delete</Button>
                </Box>
              ))}
              <Button onClick={handleOnKeyAdd}>Add</Button>
            </Box>
          )}
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={jsonEdit} />}
              onChange={handleOnJsonToggle}
              label="Json"
            />
          </FormGroup>
          {JSON.stringify(changes)}
          {infoMessage}
          <Button onClick={handleOnSaveVariables}>Save</Button>
          <Button onClick={handleOnCancelEdit}>Cancel</Button>
        </div>
      ) : (
        <div>
          {workingKV.map(({ key: k, value: v }) => (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
              }}
              key={k}
            >
              {k}: {v}
            </Box>
          ))}
          <Button onClick={handleOnEditVariables}>Edit variables</Button>
        </div>
      )}
    </Box>
  );
};

export default KVEditor;
