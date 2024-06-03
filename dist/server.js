"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const axios_1 = __importDefault(require("axios"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const ContractABI_1 = require("./constants/ContractABI");
const NFTContractABI_1 = require("./constants/NFTContractABI");
const node_cron_1 = __importDefault(require("node-cron"));
const express_1 = __importDefault(require("express"));
const bodyParser = require("body-parser");
const updatePlantHealth_1 = require("./utils/updatePlantHealth");
const waterPlants_1 = require("./utils/waterPlants");
const updatePlantXP_1 = require("./utils/updatePlantXP");
const growPlant_1 = require("./utils/growPlant");
const updatePlantGrowthBasedOnRSI_1 = require("./utils/updatePlantGrowthBasedOnRSI");
const mintEventListener_1 = require("./utils/listeners/mintEventListener");
const growEventListener_1 = require("./utils/listeners/growEventListener");
const cors = require("cors");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(bodyParser.json());
app.use(cors());
// Environment variables (make sure to set these in your .env file or environment)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const INFURA_KEY = process.env.INFURA_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const MARKET_CONDITION_UUID = process.env.MARKET_CONDITION_UUID;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const API_SECRET_KEY = process.env.TAAPI_API_KEY; // Your API key stored in environment variables
// Initialize Supabase
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
// Setup Ethereum provider and contract instance
const provider = new ethers_1.InfuraProvider("sepolia", INFURA_KEY);
const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, ContractABI_1.CONTRACT_ABI, provider);
const nftContract = new ethers_1.ethers.Contract(NFT_CONTRACT_ADDRESS, NFTContractABI_1.NFT_CONTRACT_ABI, provider);
const wallet = new ethers_1.ethers.Wallet(WALLET_PRIVATE_KEY, provider);
const contractWrite = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, ContractABI_1.CONTRACT_ABI, wallet);
const nftContractWrite = new ethers_1.ethers.Contract(NFT_CONTRACT_ADDRESS, NFTContractABI_1.NFT_CONTRACT_ABI, wallet);
// Schedule cron job to update 
let logger = node_cron_1.default.schedule('* * * * *', () => console.log("Logging \n"));
// Plant Growth Based on Contract RSI
// Runs at midnight every day
let rsiJob = node_cron_1.default.schedule('0 0 * * *', () => {
    console.log('Cron job for UPDATING RSI scheduled to run at:', new Date().toISOString());
    (0, updatePlantGrowthBasedOnRSI_1.updatePlantGrowthBasedOnRSI)(supabase, contractWrite, MARKET_CONDITION_UUID)
        .then(() => console.log('Cron job executed successfully.'))
        .catch((error) => console.error('Failed to execute cron job:', error));
});
// Cron Job to update Plant Health
// Schedule the cron job to run at 6 AM and 6 PM EST
let healthJob = node_cron_1.default.schedule('0 6,18 * * *', () => {
    console.log('Cron job for PLANT HEALTH scheduled to run at:', new Date().toISOString());
    (0, updatePlantHealth_1.updatePlantHealth)(supabase);
}, {
    scheduled: true,
    timezone: "America/New_York"
});
// Cron Job to update Plant XP
// If XP is over threshold
let xpJob = node_cron_1.default.schedule('* * * * *', () => {
    // let xpJob = cron.schedule('0 0 * * *', () => {
    console.log('Cron job to UPDATE PLANT XP scheduled to run at:', new Date().toISOString());
    (0, updatePlantXP_1.updatePlantXP)(supabase);
});
(0, updatePlantGrowthBasedOnRSI_1.updatePlantGrowthBasedOnRSI)(supabase, contractWrite, MARKET_CONDITION_UUID);
(0, updatePlantHealth_1.updatePlantHealth)(supabase);
// Define any routes as necessary
app.get('/health', (req, res) => {
    res.send('Econobloom NFT Service Running');
});
// RETURN ALL PLANT DATA
app.get('/plants/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield supabase.from('plants').select('*');
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).send("Error fetching plants.");
    }
}));
// Get RSI tracking data
app.get('/rsi/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield supabase.from("rsi_data").select("*");
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).send("Error fetching RSI.");
    }
}));
// Metadata endpoint
app.get('/metadata/:tokenId', (req, res) => {
    const { tokenId } = req.params;
    const metadata = {
        name: `Plant #${tokenId}`,
        description: "A unique plant in the Econobloom ecosystem.",
        image: `https://example.com/path/to/images/${tokenId}.png`,
        attributes: [
            { trait_type: "Sunlight", value: "High" },
            { trait_type: "Water", value: "Medium" },
            { trait_type: "Growth Rate", value: "Slow" }
        ]
    };
    res.json(metadata);
});
app.get('/fetch-rsi', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://api.taapi.io/rsi?secret=${API_SECRET_KEY}&exchange=binance&symbol=ETH/USDT&interval=1d`);
        console.log(response.data);
        res.json({ rsi: response.data });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch RSI' });
    }
}));
// Update Plant Growth Endpoint
app.post('/grow/:plantId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const plantId = req.params.plantId;
    console.log("Attempting to evolve plant: ", plantId);
    try {
        const updatedPlant = yield (0, growPlant_1.growPlant)(supabase, plantId);
        res.status(200).json(updatedPlant);
    }
    catch (error) {
        res.status(500).send('Error growing plant');
    }
}));
// Water Plant Endpoint
app.post('/water/:plantId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const plantId = req.params.plantId;
    console.log("Attempting to water plant: ", plantId);
    try {
        const updatedPlant = yield (0, waterPlants_1.waterPlant)(supabase, plantId, nftContractWrite);
        res.status(200).json(updatedPlant);
    }
    catch (error) {
        res.status(500).send('Error watering plant');
    }
}));
// START UP SERVER
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
    (0, growEventListener_1.growEventListener)(supabase, nftContract);
    (0, mintEventListener_1.mintEventListener)(supabase, nftContract, MARKET_CONDITION_UUID); // Setup the blockchain event listener
    console.log('Listening for mint events...');
    rsiJob.start();
    healthJob.start();
    xpJob.start();
    logger.start();
});
