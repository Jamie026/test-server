// app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { sequelize } = require('./src/config/dbConfig');
const { errorHandler } = require('./src/utils/errorHandler');

const app = express();

const reportRoutes = require("./src/routes/ReportRoutes");
const negativizationRoutes = require("./src/routes/NegativizationRoutes");
const AsinRoutes = require("./src/routes/AsinRoutes");
const SkuRoutes = require("./src/routes/SkuRoutes");
const portfolioRoutes = require("./src/routes/PortfolioRoutes");
const campaignRoutes = require("./src/routes/CampaignRoutes");
const adGroupsRoutes = require("./src/routes/AdGroupsRoutes");
const ModeNegativizationRoutes = require("./src/routes/ModeNegativizationRoutes");

// Middlewares base
app.use(express.json());
app.use(helmet());
app.use(cors());

// Database connection
sequelize.authenticate()
    .then(() => console.log('✅ MySQL conectado'))
    .catch(err => console.error('❌ Error de MySQL:', err));

// Routes
app.use('/api', require('./src/routes/userRoutes'));

app.use("/api/report", reportRoutes);
app.use("/api/negativization", negativizationRoutes);
app.use("/api/asins", AsinRoutes);
app.use("/api/skus", SkuRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/adGroups", adGroupsRoutes);
app.use("/api/modeNegativizations", ModeNegativizationRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
