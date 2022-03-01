import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function HowTo() {
  return (
    <Box>
      <Typography variant="body1">
        After configuring your ENVs through the Portunus UI, there are two main
        ways to interact with them:
      </Typography>
      <Accordion>
        <AccordionSummary aria-controls="panel1a-content" id="panel1a-header">
          <Typography variant="h6">Print Env CLI</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <ul>
              <li>
                using a local <code>.env</code> file, you can automatically
                connect with Portunus
              </li>
              <li>
                <code>print-env</code> is configured to process the&nbsp;
                <code>PORTUNUS_JWT</code> key to pull in all associated
                variables
              </li>
              <li>
                install&nbsp;
                <a href="https://pypi.org/project/print-env/">print-env</a>
                &nbsp; version &gt;= 2.2.0 CLI&nbsp;
              </li>

              <li>
                include your desired team+project+stage in&nbsp;
                <code>.env</code> with the format: &nbsp;
                <code>
                  PORTUNUS_JWT=[jwt]/[team id]/[project name]/[stage name]
                </code>{" "}
                <ul>
                  <li>
                    running <code>print-env</code> will print out the ENV
                    associated with the team+project+stage provided above
                  </li>
                  <li>
                    example usage:{" "}
                    <code>env $(print-env) node some-command</code>
                  </li>
                </ul>
              </li>
            </ul>
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary aria-controls="panel2a-content" id="panel2a-header">
          <Typography variant="h6">Portunus API</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <ul>
              <li>
                You can call the api directly via&nbsp;
                <code>
                  https://cli.mindswire.com/env?team=[team id]&project=[project
                  name]&stage=[stage name]
                </code>
              </li>
              <li>
                supply your jwt token via the <code>portunus-jwt</code>{" "}
                header
              </li>
              <li>
                The environment variables are a JSON object found in the{" "}
                <code>response.vars</code> field
              </li>
            </ul>
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
