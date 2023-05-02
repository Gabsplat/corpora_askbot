import { Box } from "@mantine/core";
import React from "react";

function RoundedLogo() {
  return (
    <Box
      style={{
        position: "relative",
        margin: "0 auto",
        width: "100px",
        backgroundColor: "#1a0948e8",
        padding: "10px",
        borderRadius: "100%",
        border: "1px solid #8282825c",
      }}
    >
      <img style={{ width: "100%" }} src="/images/logo.png" />
    </Box>
  );
}

export default RoundedLogo;
