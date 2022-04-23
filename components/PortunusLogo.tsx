import Typography, { TypographyProps } from "@mui/material/Typography";
import KeyIcon from "@mui/icons-material/Key";
import { SvgIconProps } from "@mui/material/SvgIcon";

type LogoPropTypes = {
  color?: string;
  variant?: TypographyProps["variant"];
  keySize?: SvgIconProps["fontSize"];
};

const PortunusLogo = ({
  color = "black",
  variant = "h6",
  keySize = "small",
}: LogoPropTypes) => {
  return (
    <Typography
      variant={variant}
      component="div"
      sx={{
        color,
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
      }}
    >
      P
      <KeyIcon fontSize={keySize} sx={{ color, transform: "rotate(-30deg)" }} />
      tunus
    </Typography>
  );
};

export default PortunusLogo;
