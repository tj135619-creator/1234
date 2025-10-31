import { Label } from 'src/components/label';
import { Timeline, CalendarMonth, People, Checklist, SmartToy, AccountCircle, Lock, DisabledByDefault } from "@mui/icons-material";

// ----------------------------------------------------------------------

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <SmartToy fontSize="medium" />,
  },
  {
    title: 'Your Lessons',
    path: '/user',
    icon: <Timeline fontSize="medium" />,
  },
  {
    title: 'Community',
    path: '/products',
    icon: <People fontSize="medium" />,
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
  },
  {
    title: 'Action Tracker',
    path: '/blog',
    icon: <Checklist fontSize="medium" />,
  },
  {
    title: 'Your Profile',
    path: '/profile',
    icon: <AccountCircle fontSize="medium" />,
  },
  {
    title: 'Sign in',
    path: '/sign-in',
    icon: <Lock fontSize="medium" />,
  }
];
