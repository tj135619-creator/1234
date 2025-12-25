import React, { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction, Paper, Box } from "@mui/material";
import { Timeline, CalendarMonth, People, Checklist, SmartToy } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  School,
  Person,
} from '@mui/icons-material';


// Define your routes for each tab
const tabs = [
  { label: 'Home', icon: <Home fontSize="large" />, path: '/' },
  { label: 'Lessons', icon: <School fontSize="large" />, path: '/user' },
  { label: 'Community', icon: <People fontSize="large" />, path: '/products' },
  { label: 'Actions', icon: <Checklist fontSize="large" />, path: '/blog' },
  { label: 'Profile', icon: <Person fontSize="large" />, path: '/profile' },
];


export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  // Update activeTab based on current route
  useEffect(() => {
    const currentIndex = tabs.findIndex(tab => tab.path === location.pathname);
    if (currentIndex !== -1) setActiveTab(currentIndex);
  }, [location.pathname]);

  const handleChange = (_, newValue: number) => {
    setActiveTab(newValue);
    navigate(tabs[newValue].path);
  };

  return (
    <>
      {/* Add padding to prevent content from being covered */}
      <Box  />

      <Paper
  sx={{
    position: 'relative',
    height: '80px',
    borderRadius: 0,
    backdropFilter: 'blur(12px)',
    background: 'rgba(36, 0, 70, 0.85)', // ✅ SAME as top bar
    borderTop: '1px solid rgba(168, 85, 247, 0.25)', // ✅ mirror border
    boxShadow: 'none',                  // ✅ apps don’t glow here
    flexShrink: 0,
  }}
  elevation={0}
>


        <BottomNavigation
          showLabels
          value={activeTab}
          onChange={handleChange}
          sx={{
            bgcolor: "transparent",
            height: "100%",
            "& .Mui-selected": {
              color: "#fbbf24 !important",
              "& .MuiSvgIcon-root": {
                transform: "scale(1.1)",
                filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))",
              },
            },
            "& .MuiBottomNavigationAction-root": {
  color: 'rgba(233, 213, 255, 0.6)',
},
            "& .MuiBottomNavigationAction-label": {
              fontWeight: 600,
              fontSize: "0.75rem",
              marginTop: "4px",
              transition: "all 0.3s ease",
              "&.Mui-selected": {
                fontSize: "0.8rem",
                fontWeight: 700,
              },
            },
            "& .MuiSvgIcon-root": {
              transition: "all 0.3s ease",
            },
          }}
        >
          {tabs.map((tab) => (
            <BottomNavigationAction
              key={tab.label}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
}
