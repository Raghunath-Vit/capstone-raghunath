import React from "react";
import { Container, Grid, Typography, Divider } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer style={{ backgroundColor: "#2c2c54", padding: "40px 0" }}>
      <Container>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom color="white" align="center">
              Company
            </Typography>
            <ul style={{ listStyleType: "none", padding: 0, textAlign: "center" }}>
              {["About us", "Terms & conditions", "Privacy policy", "UC impact", "Careers"].map((item) => (
                <li key={item}>
                  <Typography variant="body1" color="#d3d3d3">
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom color="white" align="center">
              UC Reviews
            </Typography>
            <ul style={{ listStyleType: "none", padding: 0, textAlign: "center" }}>
              {["Categories near you", "Blog", "Contact us", "For partners"].map((item) => (
                <li key={item}>
                  <Typography variant="body1" color="#d3d3d3">
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom color="white" align="center">
              Register
            </Typography>
            <Typography variant="body1" color="#d3d3d3" align="center">
              Register as a professional
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom color="white" align="center">
              Follow us
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {[
                { icon: <Facebook />, color: "#3b5998" },
                { icon: <Twitter />, color: "#1DA1F2" },
                { icon: <Instagram />, color: "#C13584" },
                { icon: <LinkedIn />, color: "#0077b5" },
              ].map(({ icon, color }, index) => (
                <Grid item key={index}>
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div style={{ color }}>{icon}</div>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <Divider style={{ margin: "20px 0", backgroundColor: "white" }} />
        <Typography variant="body2" color="white" align="center">
          © Copyright 2024 Raghunath. All rights reserved.
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;
