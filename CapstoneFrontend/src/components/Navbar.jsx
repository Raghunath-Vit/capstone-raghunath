import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Book as BookIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  Build as ServiceIcon,
  People as ManageIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/actions";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const handleLogout = () => {
    toggleDrawer(false)
    dispatch(logoutUser());
    navigate("/login");
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const menuItems = (
    <>
      {user && user.role === "admin" && (
        <>
          <ListItem button component={Link} to="/create-category"  onClick={toggleDrawer(false)}>
            <CategoryIcon sx={{ marginRight: 1 }} />
            <ListItemText primary="Category" />
          </ListItem>
          <ListItem button component={Link} to="/create-service"  onClick={toggleDrawer(false)}>
            <ServiceIcon sx={{ marginRight: 1 }} />
            <ListItemText primary="Service" />
          </ListItem>
          <ListItem button component={Link} to="/view-users"  onClick={toggleDrawer(false)}>
            <ManageIcon sx={{ marginRight: 1 }} />
            <ListItemText primary="Manage" />
          </ListItem>
        </>
      )}

      {user && user.role === "worker" && (
        <>
          <Grid item>
            <Button color="inherit" component={Link} to="/create-service"  onClick={toggleDrawer(false)}>
              <ServiceIcon sx={{ marginRight: 1 }} /> Add Service
            </Button>
          </Grid>
          <Grid item>
            <Button color="inherit" component={Link} to="/works"  onClick={toggleDrawer(false)}>
              <BookIcon sx={{ marginRight: 1 }} /> Your Works
            </Button>
          </Grid>
          <ListItem button onClick={handleLogout}>
            <LogoutIcon sx={{ marginRight: 1 }} />
            <ListItemText primary="Logout" />
          </ListItem>
        </>
      )}

      {user && user.role === "user" && (
        <>
          <Grid item>
            <Button color="inherit" component={Link} to="/create-service"  onClick={toggleDrawer(false)}>
              <ServiceIcon sx={{ marginRight: 1 }} /> Services
            </Button>
          </Grid>
          <Grid item>
            <Button
              color="inherit"
              component={Link}
              to={`/mybooking/${user.id}`}  onClick={toggleDrawer(false)}
            >
              <BookIcon sx={{ marginRight: 1 }} /> My Bookings
            </Button>
          </Grid>
          <ListItem button onClick={handleLogout}>
            <LogoutIcon sx={{ marginRight: 1 }} />
            <ListItemText primary="Logout" />
          </ListItem>
        </>
      )}
    </>
  );

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "#413f75",
        width: "100%",
        paddingX: { xs: 2, sm: 4 },
        
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          maxWidth: "1200px",
          marginX: "auto",
          paddingY: { xs: 1, sm: 1.5 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: isMobile ? "space-between" : "flex-start",
            width: "100%",
          }}
        >
          {isMobile ? (
            <>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ color: "#ffffff" }}
              >
                <MenuIcon />
              </IconButton>
              <IconButton
                component={Link}
                to="/"
                sx={{
                  color: "#ffffff",
                  fontSize: "2rem",
                  marginLeft: "auto",
                  marginRight: 5,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    padding: 0,
                    height: "auto",
                    width: "auto",
                    lineHeight: "normal",
                  }}
                >
                  My Logo
                </p>
              </IconButton>
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                <IconButton
                  onClick={toggleDrawer(false)}
                  sx={{ alignSelf: "flex-end", margin: 1 }}
                >
                  <CloseIcon />
                </IconButton>
                <List sx={{ bgcolor: "#fafafa", color: "#6a1b9a" }}>
                  {menuItems}
                </List>
              </Drawer>
            </>
          ) : (
            <>
              <IconButton
                component={Link}
                to="/"
                sx={{ color: "#ffffff", fontSize: "2rem", marginRight: 2 }}
              >
                <p
                  style={{
                    margin: 0,
                    padding: 0,
                    height: "auto",
                    width: "auto",
                    lineHeight: "normal",
                  }}
                >
                  My Logo
                </p>
              </IconButton>
              <Grid
                container
                spacing={isTablet ? 1 : 2}
                justifyContent="flex-end"
                alignItems="center"
                sx={{ flexWrap: "nowrap" }}
              >
                {user && user.role === "admin" && (
                  <>
                    <Grid item>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/create-category"
                      >
                        <CategoryIcon sx={{ marginRight: 1 }} /> Category
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/create-service"
                      >
                        <ServiceIcon sx={{ marginRight: 1 }} /> Service
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button color="inherit" component={Link} to="/view-users">
                        <ManageIcon sx={{ marginRight: 1 }} /> Manage
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button color="inherit" onClick={handleLogout}>
                        <LogoutIcon sx={{ marginRight: 1 }} /> Logout
                      </Button>
                    </Grid> 
                  </>
                )}

                {user && user.role === "worker" && (
                  <>
                    <Grid item>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/create-service"
                      >
                        <ServiceIcon sx={{ marginRight: 1 }} /> Add Service
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button color="inherit" component={Link} to="/works">
                        Your Works
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button color="inherit" onClick={handleLogout}>
                        <LogoutIcon sx={{ marginRight: 1 }} /> Logout
                      </Button>
                    </Grid> 
                  </>
                )}

                {user && user.role === "user" && (
                  <>
                    <Grid item>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/create-service"
                      >
                        <ServiceIcon sx={{ marginRight: 1 }} /> Services
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        color="inherit"
                        component={Link}
                        to={`/mybooking/${user.id}`}
                      >
                        My Bookings
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button color="inherit" onClick={handleLogout}>
                        <LogoutIcon sx={{ marginRight: 1 }} /> Logout
                      </Button>
                    </Grid> 
                  </>
                )}

               
              </Grid>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;


