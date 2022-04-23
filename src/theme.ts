import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: "#048989",
    },
    secondary: {
      main: "#0000007d",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#f3f3f3",
    },
  },
});

export default theme;
