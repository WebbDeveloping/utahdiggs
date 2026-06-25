"use client";

import Button, { type ButtonProps } from "@mui/material/Button";
import NextLink from "next/link";

type MarketingLinkButtonProps = ButtonProps<typeof NextLink> & {
  href: string;
};

export default function MarketingLinkButton({
  href,
  children,
  ...props
}: MarketingLinkButtonProps) {
  return (
    <Button component={NextLink} href={href} {...props}>
      {children}
    </Button>
  );
}
