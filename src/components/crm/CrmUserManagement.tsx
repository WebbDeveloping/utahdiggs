"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { CRM_USER_ROLES, formatUserRole, type CrmUserRole } from "@/lib/crm/roles";
import {
  createCrmUserAction,
  resetCrmUserPasswordAction,
  setCrmUserActiveAction,
  updateCrmUserRoleAction,
  type CrmUserActionState,
} from "@/lib/crm/user-actions";

type CrmUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: CrmUserRole;
  active: boolean;
  createdAt: Date;
};

type CrmUserManagementProps = {
  users: CrmUserRow[];
  currentUserId: string;
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "background.default",
  },
};

const initialCreateState: CrmUserActionState = {};

export default function CrmUserManagement({
  users,
  currentUserId,
}: CrmUserManagementProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [createState, createAction, createPending] = useActionState(
    createCrmUserAction,
    initialCreateState,
  );

  useEffect(() => {
    if (createState.success) {
      setCreateOpen(false);
      router.refresh();
    }
  }, [createState.success, router]);

  function handleRoleChange(userId: string, role: CrmUserRole) {
    startTransition(async () => {
      setRowMessage(null);
      const result = await updateCrmUserRoleAction(userId, role);
      setRowMessage(result.error ?? result.success ?? null);
      if (!result.error) router.refresh();
    });
  }

  function handleActiveToggle(userId: string, active: boolean) {
    startTransition(async () => {
      setRowMessage(null);
      const result = await setCrmUserActiveAction(userId, active);
      setRowMessage(result.error ?? result.success ?? null);
      if (!result.error) router.refresh();
    });
  }

  function handleResetPassword() {
    if (!resetUserId || !resetPassword) return;
    startTransition(async () => {
      setResetError(null);
      const result = await resetCrmUserPasswordAction(resetUserId, resetPassword);
      if (result.error) {
        setResetError(result.error);
        return;
      }
      setResetUserId(null);
      setResetPassword("");
      setRowMessage(result.success ?? "Password updated.");
    });
  }

  return (
    <Stack spacing={3}>
      {rowMessage ? (
        <Alert
          severity={rowMessage.includes("Cannot") || rowMessage.includes("not") ? "error" : "success"}
          onClose={() => setRowMessage(null)}
        >
          {rowMessage}
        </Alert>
      ) : null}

      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Add user
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{user.name ?? "—"}</Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }} disabled={isPending}>
                    <Select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as CrmUserRole)
                      }
                      disabled={user.id === currentUserId || !user.active}
                    >
                      <MenuItem value={CRM_USER_ROLES.ADMIN}>Admin</MenuItem>
                      <MenuItem value={CRM_USER_ROLES.AGENT}>Agent</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.active ? "Active" : "Inactive"}
                    color={user.active ? "success" : "default"}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setResetUserId(user.id);
                        setResetPassword("");
                        setResetError(null);
                      }}
                    >
                      Reset password
                    </Button>
                    {user.id !== currentUserId ? (
                      <Button
                        size="small"
                        color={user.active ? "error" : "primary"}
                        variant="outlined"
                        disabled={isPending}
                        onClick={() => handleActiveToggle(user.id, !user.active)}
                      >
                        {user.active ? "Deactivate" : "Reactivate"}
                      </Button>
                    ) : null}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Add CRM user
          <IconButton aria-label="Close" onClick={() => setCreateOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" action={createAction}>
          <DialogContent>
            <Stack spacing={2}>
              {createState.error ? <Alert severity="error">{createState.error}</Alert> : null}
              {createState.success ? (
                <Alert severity="success">{createState.success}</Alert>
              ) : null}
              <TextField
                name="name"
                label="Name"
                required
                fullWidth
                sx={inputSx}
                error={Boolean(createState.fieldErrors?.name)}
                helperText={createState.fieldErrors?.name}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                required
                fullWidth
                sx={inputSx}
                error={Boolean(createState.fieldErrors?.email)}
                helperText={createState.fieldErrors?.email}
              />
              <TextField
                name="password"
                label="Temporary password"
                type="password"
                required
                fullWidth
                sx={inputSx}
                error={Boolean(createState.fieldErrors?.password)}
                helperText={
                  createState.fieldErrors?.password ?? "Minimum 8 characters."
                }
              />
              <FormControl fullWidth sx={inputSx}>
                <InputLabel id="create-user-role-label">Role</InputLabel>
                <Select
                  name="role"
                  labelId="create-user-role-label"
                  label="Role"
                  defaultValue={CRM_USER_ROLES.AGENT}
                  error={Boolean(createState.fieldErrors?.role)}
                >
                  <MenuItem value={CRM_USER_ROLES.AGENT}>
                    {formatUserRole(CRM_USER_ROLES.AGENT)}
                  </MenuItem>
                  <MenuItem value={CRM_USER_ROLES.ADMIN}>
                    {formatUserRole(CRM_USER_ROLES.ADMIN)}
                  </MenuItem>
                </Select>
                {createState.fieldErrors?.role ? (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {createState.fieldErrors.role}
                  </Typography>
                ) : null}
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createPending}>
              Create user
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(resetUserId)}
        onClose={() => setResetUserId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {resetError ? <Alert severity="error">{resetError}</Alert> : null}
            <TextField
              label="New temporary password"
              type="password"
              fullWidth
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              sx={inputSx}
              helperText="Minimum 8 characters."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetUserId(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={isPending || resetPassword.length < 8}
            onClick={handleResetPassword}
          >
            Save password
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
