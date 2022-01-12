import React, { useState } from "react";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import { AlertTitleClassKey } from "@mui/material";
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
  onItemEdit?: (i: T) => void;
  onItemRemove?: (i: T) => void;
  confirmCount: number;
};

/*
  type link between ListItem and the form value?!
  modal edit, edit below, edit overlay
  - useForm as the base
*/

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
  onItemEdit,
  onItemRemove,
  confirmCount,
}: ListProps<ListItem>) {
  const [confirm, setConfirm] = useState({} as Confirm);
  const handleOnDelete = (o: ListItem) => () => {
    const key = o[keyKey];
    if (confirm[key] === undefined || confirm[key] < confirmCount + 1) {
      setConfirm((old) => ({
        ...old,
        [key]: (old[key] || 0) + 1,
      }));
    } else if (onItemRemove) {
      onItemRemove(o);
    }
  };

  const handleOnEdit = () => {};

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
            !NEXT_PUBLIC_READ_ONLY && (
              <Box>
                {/* {onItemEdit && (
                  <Button onClick={handleOnEdit(o)}>
                    {confirm === 0 || confirm === CONFIRM_COUNT + 1
                      ? "Delete"
                      : `Are you sure? (${confirm} / ${CONFIRM_COUNT})`}
                  </Button>
                )} */}
                {onItemRemove && (
                  <Button
                    variant={
                      confirm[o[keyKey]] === confirmCount + 1
                        ? "contained"
                        : "outlined"
                    }
                    onClick={handleOnDelete(o)}
                  >
                    {confirm[o[keyKey]] === undefined ||
                    confirm[o[keyKey]] === confirmCount + 1
                      ? "Delete"
                      : `Are you sure? (${
                          confirm[o[keyKey]] - 1
                        } / ${confirmCount})`}
                  </Button>
                )}
              </Box>
            )
          }
        >
          <ListItemButton onClick={onItemClick ? onItemClick(o) : undefined}>
            <ListItemText
              primary={o[titleKey]}
              secondary={o[descriptionKey] || ""}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

export default InteractiveList;
