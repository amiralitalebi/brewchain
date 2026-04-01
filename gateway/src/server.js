import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

app.use(cors());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "brewchain-gateway",
    apiBaseUrl: API_BASE_URL,
    timestamp: new Date().toISOString()
  });
});

app.use(
  "/api",
  createProxyMiddleware({
    target: API_BASE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api": ""
    },
    onError: (err, req, res) => {
      res.status(500).json({
        message: "Gateway proxy error",
        error: err.message
      });
    }
  })
);

app.listen(PORT, () => {
  console.log(`brewchain gateway running on port ${PORT}`);
});