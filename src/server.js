"use strict";

// Imports
const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const cons = require("consolidate");
const path = require("path");

const app = express();

// Globals
const PORT = process.env.PORT || "3000";

// Configuración de Auth0 con valores reales
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET || "59d955f698160e4db3d06ef439ddc5ebc1ab12f7f5730eeba0bbc9b538e964d1",
  baseURL: process.env.BASE_URL || "https://lab-6-seguridad-informatica.onrender.com",
  clientID: process.env.AUTH0_CLIENT_ID || "BRgcL9Bs8mkR0intsYqlzPF0hOBvEsoD",
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || "https://dev-7z6znp0tgu5qdhum.us.auth0.com",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "GGhxBkcyxFaeDIjTrxpjTFb-9rZkE4O7wFiBPPhdtwSCLUbcM2_AnT6pJ0bs-RcW"
};

// MVC View Setup
app.engine("html", cons.swig);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// App middleware
app.use("/static", express.static(path.join(__dirname, "static")));

// Auth0 middleware
app.use(auth(config));

// Middleware de debug
app.use((req, res, next) => {
  console.log("Request URL:", req.url);
  console.log("Is Authenticated:", req.oidc?.isAuthenticated());
  next();
});

// Rutas
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/test-auth", (req, res) => {
  res.json({
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user || null,
    config: {
      baseURL: config.baseURL,
      clientID: config.clientID,
      issuerBaseURL: config.issuerBaseURL
    }
  });
});

app.get("/dashboard", requiresAuth(), (req, res) => {
  console.log("Usuario autenticado:");
  console.log(req.oidc.user);

  const userInfo = {
    email: req.oidc.user.email,
    nickname: req.oidc.user.nickname || req.oidc.user.name,
    name: req.oidc.user.name,
    picture: req.oidc.user.picture
  };

  res.render("dashboard", { user: userInfo });
});

// Fallback 404
app.use((req, res) => {
  res.status(404).send("Página no encontrada");
});

// Iniciar servidor
app.listen(parseInt(PORT), () => {
  console.log("Server running on port: " + PORT);
  console.log("Visit " + config.baseURL);
});