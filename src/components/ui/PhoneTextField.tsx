"use client";

import { ChangeEvent, useState } from "react";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { formatPhoneDisplay, formatPhoneInput } from "@/lib/phone";

export default function PhoneTextField({
  value: valueProp,
  defaultValue,
  onChange,
  ...props
}: TextFieldProps) {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    formatPhoneDisplay(String(defaultValue ?? "")),
  );

  const displayValue = isControlled
    ? formatPhoneDisplay(String(valueProp ?? ""))
    : internalValue;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhoneInput(event.target.value);
    event.target.value = formatted;

    if (!isControlled) {
      setInternalValue(formatted);
    }

    onChange?.(event);
  }

  return (
    <TextField
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete={props.autoComplete ?? "tel"}
      value={displayValue}
      onChange={handleChange}
    />
  );
}
