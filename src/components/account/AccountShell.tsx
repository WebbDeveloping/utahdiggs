import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SitePageLayout from "@/components/layout/SitePageLayout";
import { consumerSignOutAction } from "@/lib/consumer/actions";

type AccountShellProps = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
};

const placeholderSections = [
  {
    title: "Saved homes",
    description: "Homes you've favorited while browsing will appear here.",
    icon: FavoriteBorderOutlinedIcon,
  },
  {
    title: "Saved searches",
    description: "Your saved search filters and listing alerts will live here.",
    icon: SearchOutlinedIcon,
  },
  {
    title: "My listings",
    description: "If you're selling with Glide RE, your listing dashboards will appear here.",
    icon: HomeWorkOutlinedIcon,
  },
] as const;

export default function AccountShell({ user }: AccountShellProps) {
  const displayName = user.name?.trim() || user.email;

  return (
    <SitePageLayout user={user}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Box>
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 1 }}>
                Welcome back{displayName ? `, ${displayName.split(" ")[0]}` : ""}
              </Typography>
              <Typography color="text.secondary">{user.email}</Typography>
            </Box>
            <Box component="form" action={consumerSignOutAction}>
              <Button type="submit" variant="outlined" color="inherit">
                Sign out
              </Button>
            </Box>
          </Stack>

          <Grid container spacing={3}>
            {placeholderSections.map((section) => {
              const Icon = section.icon;
              return (
                <Grid key={section.title} size={{ xs: 12, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      opacity: 0.85,
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                          <Icon color="action" />
                          <Typography variant="h6">{section.title}</Typography>
                          <Chip label="Coming soon" size="small" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Container>
    </SitePageLayout>
  );
}
