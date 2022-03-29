import Typography from "@mui/material/Typography";
import KeyIcon from "@mui/icons-material/Key";

type LogoPropTypes = {
  color: string;
};

const PortunusLogo = ({ color }: LogoPropTypes) => {
  return (
    <Typography
      variant="h6"
      component="div"
      sx={{
        color,
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
      }}
    >
      P
      <KeyIcon fontSize="small" sx={{ color, transform: "rotate(-30deg)" }} />
      tunus
    </Typography>
  );
};

export default PortunusLogo;
