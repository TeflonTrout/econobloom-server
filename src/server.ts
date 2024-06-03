import { InfuraProvider, ethers } from 'ethers';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv"
import { CONTRACT_ABI } from './constants/ContractABI';
import { NFT_CONTRACT_ABI } from './constants/NFTContractABI';
import cron from 'node-cron';
import express from "express"
import bodyParser = require('body-parser');
import { updatePlantHealth } from './utils/updatePlantHealth';
import { waterPlant } from './utils/waterPlants';
import { updatePlantXP } from './utils/updatePlantXP';
import { growPlant } from './utils/growPlant';
import { updatePlantGrowthBasedOnRSI } from './utils/updatePlantGrowthBasedOnRSI';
import { mintEventListener } from './utils/listeners/mintEventListener';
import { growEventListener } from './utils/listeners/growEventListener';
const cors = require("cors")

dotenv.config()
const app = express()
app.use(bodyParser.json());
app.use(cors())

// Environment variables (make sure to set these in your .env file or environment)
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const INFURA_KEY = process.env.INFURA_KEY!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS!;
const MARKET_CONDITION_UUID = process.env.MARKET_CONDITION_UUID!;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY!;
const API_SECRET_KEY = process.env.TAAPI_API_KEY!; // Your API key stored in environment variables

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Setup Ethereum provider and contract instance
const provider = new InfuraProvider("sepolia", INFURA_KEY);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider)
const contractWrite = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
const nftContractWrite = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, wallet);

// Schedule cron job to update 
// Plant Growth Based on Contract RSI
// Runs at midnight every day
cron.schedule('0 0 * * *', () => updatePlantGrowthBasedOnRSI(supabase, contractWrite, MARKET_CONDITION_UUID)); 

// Cron Job to update Plant Health
// Schedule the cron job to run at 6 AM and 6 PM EST
cron.schedule('0 6,18 * * *', () => {
    console.log('Cron job triggered');
    updatePlantHealth(supabase);
}, {
    scheduled: true,
    timezone: "America/New_York"
});

// Cron Job to update Plant XP
// If XP is over threshold
cron.schedule('0 0 * * *', () => updatePlantXP(supabase));

updatePlantGrowthBasedOnRSI(supabase, contractWrite, MARKET_CONDITION_UUID)
// updatePlantHealth(supabase);

// Define any routes as necessary
app.get('/health', (req, res) => {
    res.send('Econobloom NFT Service Running');
});

// RETURN ALL PLANT DATA
app.get('/plants/all', async (req, res) => {
    try {
        const { data } = await supabase.from('plants').select('*')
        res.status(200).json(data)
    } catch (error) {
        res.status(500).send("Error fetching plants.")

    }
})

// Get RSI tracking data
app.get('/rsi/data', async (req, res) => {
    try {
        const data = await supabase.from("rsi_data").select("*")
        res.status(200).json(data)
    } catch (error) {
        res.status(500).send("Error fetching RSI.")
    }
})

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

app.post('/fetch-rsi', async (req, res) => {
    try {
        const response = await axios.get(`https://api.taapi.io/rsi?secret=${API_SECRET_KEY}&exchange=binance&symbol=ETH/USDT&interval=1d`);
        res.json({ rsi: response.data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RSI' });
    }
});

// Update Plant Growth Endpoint
app.post('/grow/:plantId', async (req, res) => {
    const plantId = req.params.plantId;
    console.log("Attempting to evolve plant: ", plantId)
    try {
        const updatedPlant = await growPlant(supabase, plantId);
        res.status(200).json(updatedPlant)
    } catch (error) {
        res.status(500).send('Error growing plant');
    }
});

// Water Plant Endpoint
app.post('/water/:plantId', async (req, res) => {
    const plantId = req.params.plantId;
    console.log("Attempting to water plant: ", plantId)
    try {
        const updatedPlant = await waterPlant(supabase, plantId, nftContractWrite);
        res.status(200).json(updatedPlant)
    } catch (error) {
        res.status(500).send('Error watering plant');
    }
});

// START UP SERVER
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
    growEventListener(supabase, nftContract)
    mintEventListener(supabase, nftContract, MARKET_CONDITION_UUID);  // Setup the blockchain event listener
    console.log('Listening for mint events...');
});