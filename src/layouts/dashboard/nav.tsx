import { useTheme } from '@mui/material/styles';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { Scrollbar } from 'src/components/scrollbar';
import { WorkspacesPopover } from '../components/workspaces-popover';
import { Timeline, CalendarMonth, People, Checklist, SmartToy } from '@mui/icons-material';


export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        background: 'rgba(60, 20, 120, 0.95)', // darker purple
        backdropFilter: 'blur(10px)',
        color: '#ffffff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRight: '1px solid rgba(0,0,0,0.05)',
        [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>
  );
}

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          background: 'rgba(60, 20, 120, 0.95)', // darker purple
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>
  );
}

export function NavContent({ data, slots, workspaces, sx }: NavContentProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Title */}
      <Box sx={{ mb: 4, px: 2 }}>
        <Box sx={{ typography: 'h3', fontWeight: 'bold', color: '#fff' }}>
          GOALGRID
        </Box>
      </Box>

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {data.map((item) => {
              const isActived = item.path === pathname;

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  <ListItemButton
                    disableGutters
                    component={RouterLink}
                    href={item.path}
                    sx={[
                      (theme) => ({
                        pl: 2,
                        py: 1,
                        gap: 2,
                        pr: 1.5,
                        borderRadius: 1,
                        typography: 'body2',
                        fontWeight: 'fontWeightMedium',
                        color: '#ffffff',
                        minHeight: 44,
                        backgroundColor: isActived
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: isActived
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(255, 255, 255, 0.08)',
                        },
                      }),
                    ]}
                  >
                    <Box component="span" sx={{ width: 24, height: 24 }}>
                      {item.icon}
                    </Box>

                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Box>

                    {item.info && item.info}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>
  );
}
