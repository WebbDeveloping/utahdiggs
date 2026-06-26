"use client";

import Button, { type ButtonProps } from "@mui/material/Button";
import NextLink from "next/link";

export type LinkButtonProps = Omit<ButtonProps<typeof NextLink>, "href"> & {
  href: string;
};

export default function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Button component={NextLink} href={href} {...props}>
      {children}
    </Button>
  );
}
