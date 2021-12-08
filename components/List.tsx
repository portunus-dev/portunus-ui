import React from "react";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import BuildIcon from "@mui/icons-material/Build";

type ListProps<T> = {
  items: T[];
  selected?: T;
  keyKey?: keyof T;
  titleKey?: keyof T;
  descriptionKey?: keyof T;
  subheader?: string;
  onItemClick?: (i: T) => {};
};

/*
  highlight
  FLAGGED BY ENV
  add button
  remove fn
*/
function ThisList<ListItem>({
  items,
  selected,
  subheader,
  keyKey = "key" as keyof ListItem, // force default keys
  titleKey = "title" as keyof ListItem,
  descriptionKey,
  onItemClick,
  onItemAdd,
  onItemRemove,
}: ListProps<ListItem>) {
  const { NEXT_PUBLIC_READ_ONLY } = process.env;
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
        <ListItemButton
          divider
          selected={o === selected}
          onClick={onItemClick ? onItemClick(o) : () => {}}
          key={o[keyKey]}
          // secondaryAction={
          //   <div>
          //     <Button>{/* <BuildIcon /> */}V</Button>
          //     {/* {!NEXT_PUBLIC_READ_ONLY && (
          //       <Button onClick={onItemRemove(o)}>
          //         <DeleteIcon />
          //       </Button>
          //     )} */}
          //   </div>
          // }
        >
          <ListItemText
            primary={o[titleKey]}
            secondary={o[descriptionKey] || ""}
          />
        </ListItemButton>
      ))}
      {/* {!NEXT_PUBLIC_READ_ONLY && (
        // TODO: a form for the list item
        // TODO: an editing state, which could reuse the form (e.g. const [editOrAdd, setEditOrAdd] ...)
        <Button onClick={onItemAdd(o)}>Add</Button>
      )} */}
      {fields.map(({ key, label, type, invalidText, helperText }) => (
        <TextField
          error={form[key]?.invalid}
          helperText={form[key]?.invalid ? invalidText : helperText || ""}
          type={type || "text"}
          key={key}
          id={key}
          label={label}
          value={form[key]?.value || ""}
          onChange={(e) => dispatch({ type: key, payload: e.target.value })}
        />
      ))}
    </List>
  );
}

export default ThisList;
