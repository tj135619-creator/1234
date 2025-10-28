import React, { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction, Paper, Box } from "@mui/material";
import { Timeline, CalendarMonth, People, Checklist, SmartToy } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

// Define your routes for each tab
const tabs = [
  { label: "Progress", icon: <Timeline fontSize="large" />, path: "/profile" },
  { label: "Schedule", icon: <CalendarMonth fontSize="large" />, path: "/schedule" },
  { label: "Community", icon: <People fontSize="large" />, path: "/products" },
  { label: "Actions", icon: <Checklist fontSize="large" />, path: "/blog" },
  { label: "AI Agent", icon: <SmartToy fontSize="large" />, path: "/" },
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
      <Box sx={{ height: "80px" }} />

      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          borderRadius: 0,
          backdropFilter: "blur(16px)",
          background: "linear-gradient(to top, rgba(60, 20, 120, 0.95), rgba(80, 30, 180, 0.95))",
          boxShadow: "0 -4px 24px rgba(60, 20, 120, 0.3)",
          border: "none",
          borderTop: "1px solid rgba(80, 30, 180, 0.2)",
          zIndex: 1300,
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
              color: "rgba(233, 213, 255, 0.7)",
              fontSize: 14,
              minWidth: "70px",
              padding: "8px 12px",
              transition: "all 0.3s ease",
              "&:hover": {
                color: "rgba(233, 213, 255, 1)",
                backgroundColor: "rgba(80, 30, 180, 0.15)",
                borderRadius: "16px",
              },
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
