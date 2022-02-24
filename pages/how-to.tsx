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
                using a local <strong>.env</strong> file, you can automatically
                connect with Portunus
              </li>
              <li>
                <strong>print-env</strong> is configured to process the&nbsp;
                <strong>PORTUNUS_JWT</strong> key to pull in all associated
                variables
              </li>
              <li>
                install&nbsp;
                <a href="https://pypi.org/project/print-env/">print-env</a>
                &nbsp; version &gt;= 2.2.0 CLI&nbsp;
              </li>

              <li>
                include your desired team+project+stage in&nbsp;
                <strong>.env</strong> with the format: &nbsp;
                <strong>
                  PORTUNUS_JWT=[jwt]/[team id]/[project name]/[stage name]
                </strong>{" "}
                <ul>
                  <li>
                    running <strong>print-env</strong> will print out the ENV
                    associated with the team+project+stage provided above
                  </li>
                  <li>
                    example usage:{" "}
                    <strong>env $(print-env) node some-command</strong>
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
                <strong>
                  https://cli.mindswire.com/env?team=[team id]&project=[project
                  name]&stage=[stage name]
                </strong>
              </li>
              <li>
                supply your jwt token via the <strong>portunus-jwt</strong>{" "}
                header
              </li>
              <li>
                The environment variables are a JSON object found in the{" "}
                <strong>response.vars</strong> field
              </li>
            </ul>
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
