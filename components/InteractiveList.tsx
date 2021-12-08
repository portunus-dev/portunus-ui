import React from "react";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

/*
====[TODO] fix Icon button crash issue
  import ListItemIcon from "@mui/material/ListItemIcon";
  import Button from "@mui/material/Button";
  import IconButton from "@mui/material/IconButton";
  import AddIcon from "@mui/icons-material/Add";
  import DeleteIcon from "@mui/icons-material/Delete";
  import BuildIcon from "@mui/icons-material/Build";
*/

type ListProps<T> = {
  items: T[];
  selected?: T;
  keyKey?: keyof T;
  titleKey?: keyof T;
  descriptionKey?: keyof T;
  subheader?: string;
  onItemClick?: (i: T) => (e: React.MouseEvent<HTMLDivElement>) => void;
};

/*
  type link between ListItem and the form value?!
  add/remove
*/
function InteractiveList<ListItem>({
  items,
  selected,
  subheader,
  keyKey = "key" as keyof ListItem, // force default keys
  titleKey = "title" as keyof ListItem,
  descriptionKey = "descripton" as keyof ListItem,
  onItemClick,
}: ListProps<ListItem>) {
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
          onClick={onItemClick ? onItemClick(o) : undefined}
          key={o[keyKey] as any}
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
    </List>
  );
}

export default InteractiveList;
