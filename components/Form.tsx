import React from "react";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import { Field, FormReducerState } from "../hooks/utils";

type FormProps = {
  fields: Field[];
  form: FormReducerState;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const Form = ({ fields, form, onChange }: FormProps) => {
  // A quick render for a material form
  // Designed to be used with ../hooks/utils > useForm
  return (
    <Box>
      {fields
        .filter(({ key }) => !form[key]?.hide)
        .map(
          ({
            key,
            label,
            type,
            invalidText,
            helperText,
            options,
            materialProps,
          }) => (
            <TextField
              key={key}
              id={key}
              error={form[key]?.invalid}
              helperText={form[key]?.invalid ? invalidText : helperText || ""}
              type={type || "text"}
              select={options || false}
              label={label}
              value={form[key]?.value || ""}
              onChange={onChange}
              disabled={form[key]?.disabled}
              {...materialProps}
            >
              {options &&
                options.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
            </TextField>
          )
        )}
    </Box>
  );
};

export default Form;
