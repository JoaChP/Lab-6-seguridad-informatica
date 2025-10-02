"use strict";

// Imports
const express = require("express");
const { auth, requiresAuth } = require('express-openid-connect');
const cons = require('consolidate');
const path = require('path');

let app = express();

// Globals
const PORT = process.env.PORT || "3000";
const SECRET = "hjsadfghjakshdfg87sd8f76s8d7f68s7f632342ug44gg423636346f"; 

// Configuración de Auth0
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: SECRET,
  baseURL: 'https://lab-6-seguridad-informatica.onrender.com',
  clientID: 'BRgcL9Bs8mkR0intsYqlzPF0hOBvEsoD',
  issuerBaseURL: 'https://dev-7z6znp0tgu5qdhum.us.auth0.com',
  clientSecret: 'GGhxBkcyxFaeDIjTrxpjTFb-9rZkE4O7wFiBPPhdtwSCLUbcM2_AnT6pJ0bs-RcW'
};

// MVC View Setup
app.engine('html', cons.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('models', path.join(__dirname, 'models'));
app.set('view engine', 'html');

// App middleware
app.use("/static", express.static("static"));

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Middleware de debug
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Is Authenticated:', req.oidc?.isAuthenticated());
  next();
});

// App routes
app.get("/", (req, res) => {
  res.render("index");  
});

// Ruta de debug
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

// Iniciar servidor
app.listen(parseInt(PORT), () => {
  console.log("Server running on port: " + PORT);
  console.log("Visit http://localhost:" + PORT);
});