"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { assignListingAgentAction } from "@/lib/crm/listing-actions";

type AgentOption = {
  id: string;
  name: string | null;
  email: string;
};

type CrmAssignAgentSelectProps = {
  listingId: string;
  currentAgentId: string | null;
  agents: AgentOption[];
};

export default function CrmAssignAgentSelect({
  listingId,
  currentAgentId,
  agents,
}: CrmAssignAgentSelectProps) {
  const [value, setValue] = useState(currentAgentId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(nextValue: string) {
    setValue(nextValue);
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await assignListingAgentAction(
        listingId,
        nextValue || null,
      );
      if (result.error) {
        setError(result.error);
        setValue(currentAgentId ?? "");
        return;
      }
      setSuccess(nextValue ? "Agent assigned." : "Listing unassigned.");
      router.refresh();
    });
  }

  return (
    <>
      <FormControl size="small" fullWidth disabled={isPending}>
        <InputLabel id={`assign-agent-${listingId}`}>Assigned agent</InputLabel>
        <Select
          labelId={`assign-agent-${listingId}`}
          label="Assigned agent"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        >
          <MenuItem value="">
            <em>Unassigned</em>
          </MenuItem>
          {agents.map((agent) => (
            <MenuItem key={agent.id} value={agent.id}>
              {agent.name ?? agent.email}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success" sx={{ mt: 1 }}>
          {success}
        </Alert>
      ) : null}
    </>
  );
}
