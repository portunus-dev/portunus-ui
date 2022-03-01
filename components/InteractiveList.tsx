import React, { useState } from "react";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
/*
====[TODO] fix Icon button crash issue
  import ListItemIcon from "@mui/material/ListItemIcon";
  import IconButton from "@mui/material/IconButton";
  import AddIcon from "@mui/icons-material/Add";
  import DeleteIcon from "@mui/icons-material/Delete";
  import BuildIcon from "@mui/icons-material/Build";
*/

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type ListProps<T extends Object> = {
  items: T[];
  selected?: T;
  keyKey?: keyof T;
  titleKey?: keyof T;
  descriptionKey?: keyof T;
  subheader?: string;
  onItemClick?: (i: T) => (e: React.MouseEvent<HTMLDivElement>) => void;
  itemSecondaryAction?: (i: T) => (e: React.MouseEvent<HTMLDivElement>) => void;
  ItemSecondaryNode?: React.ReactElement;
  onItemEdit?: (update: string, i: T) => void;
  onItemRemove?: (i: T) => void;
  confirmCount?: number;
};

type Confirm = {
  [k: string | number]: number;
};

// hack to declare all ListItem properties as strings
type StringObject = {
  [k: string]: string;
};

function InteractiveList<ListItem extends StringObject>({
  items,
  selected,
  subheader,
  keyKey = "key" as keyof ListItem,
  titleKey = "title" as keyof ListItem,
  descriptionKey = "descripton" as keyof ListItem,
  onItemClick,
  itemSecondaryAction,
  ItemSecondaryNode,
  onItemEdit,
  onItemRemove,
  confirmCount = 0,
}: ListProps<ListItem>) {
  const [confirm, setConfirm] = useState(0);
  const [deleteKey, setDeleteKey] = useState("");
  const handleOnDelete = (o: ListItem) => () => {
    const key = o[keyKey];
    if (key === deleteKey || confirmCount <= 0) {
      if (confirmCount > 0 && confirm < confirmCount + 1) {
        setConfirm((o) => o + 1);
      } else if (onItemRemove) {
        onItemRemove(o);
      }
    } else {
      setConfirm(1);
      setDeleteKey(key);
    }
  };
  const handleOnDeleteCancel = () => {
    setConfirm(0);
    setDeleteKey("");
  };

  const [editingKey, setEditingKey] = useState("");
  // TODO: useForm as the base and keys other than title
  const handleOnEdit = (o: ListItem) => () => {
    setEditingKey(o[keyKey]);
    setNewValue(o[titleKey]);
  };

  const handleOnEditCancel = () => {
    setEditingKey("");
    setNewValue("");
  };

  const [newValue, setNewValue] = useState("");

  const handleOnValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewValue(e.target.value);
  };

  const handleOnSave = (o: ListItem) => () => {
    if (onItemEdit) {
      // TODO: these won't sync up well with failures!
      setEditingKey("");
      setNewValue("");
      onItemEdit(newValue, o);
    }
  };

  return (
    <List
      subheader={
        subheader && (
          <ListSubheader component="div" id="nested-list-subheader">
            {subheader}
          </ListSubheader>
        )
      }
      dense
    >
      {items.map((o: ListItem) => (
        <ListItem
          divider
          selected={o === selected}
          key={o[keyKey]}
          secondaryAction={
            <Box sx={{ display: "flex" }}>
              {itemSecondaryAction &&
                ItemSecondaryNode &&
                React.cloneElement(ItemSecondaryNode, {
                  onClick: itemSecondaryAction(o),
                })}
              {!NEXT_PUBLIC_READ_ONLY && (
                <React.Fragment>
                  {onItemEdit && deleteKey !== o[keyKey] && (
                    <Box>
                      {editingKey === o[keyKey] ? (
                        <React.Fragment>
                          <Button onClick={handleOnSave(o)}>Save</Button>
                          <Button onClick={handleOnEditCancel}>Cancel</Button>
                        </React.Fragment>
                      ) : (
                        <Button onClick={handleOnEdit(o)}>Edit</Button>
                      )}
                    </Box>
                  )}
                  {onItemRemove && editingKey !== o[keyKey] && (
                    <React.Fragment>
                      <Button
                        variant={
                          deleteKey === o.key && confirm === confirmCount + 1
                            ? "contained"
                            : "outlined"
                        }
                        onClick={handleOnDelete(o)}
                      >
                        {deleteKey !== o.key ||
                        confirm === 0 ||
                        (confirm === confirmCount + 1 && deleteKey === o.key)
                          ? "Delete"
                          : `Are you sure? (${confirm - 1} / ${confirmCount})`}
                      </Button>
                      {confirm !== 0 && deleteKey === o.key && (
                        <Button onClick={handleOnDeleteCancel}>Cancel</Button>
                      )}
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
            </Box>
          }
        >
          {editingKey === o[keyKey] ? (
            <TextField
              variant="standard"
              value={newValue}
              onChange={handleOnValueChange}
            />
          ) : (
            <ListItemButton onClick={onItemClick ? onItemClick(o) : undefined}>
              <ListItemText
                primary={o[titleKey]}
                secondary={o[descriptionKey] || ""}
              />
            </ListItemButton>
          )}
        </ListItem>
      ))}
    </List>
  );
}

export default InteractiveList;
