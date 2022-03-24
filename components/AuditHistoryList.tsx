import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { AuditHistory } from "../utils/types";

const AuditHistoryList = ({
  auditHistory,
}: {
  auditHistory: AuditHistory[];
}) => {
  return (
    <List>
      {auditHistory.map((o, i) => (
        <ListItem divider key={i}>
          <ListItemText
            primary={`${o.email}: ${o.explanation}`}
            secondary={
              <Box>
                <p>{new Date(o.start).toString()}</p>
                <p>
                  {o.method} - {o.url}
                </p>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default AuditHistoryList;
