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
exports.fetchAndStoreRSI = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchAndStoreRSI = (supabase, ALPHA_ADVANTAGE_API_KEY) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.alphavantage.co/query?function=RSI&symbol=ETHUSD&interval=daily&time_period=10&series_type=open&apikey=${ALPHA_ADVANTAGE_API_KEY}`);
        const rsiValues = response.data["Technical Analysis: RSI"];
        console.log(rsiValues);
        const mostRecentDate = Object.keys(rsiValues)[0];
        const mostRecentRSI = rsiValues[mostRecentDate].RSI;
        const { data, error } = yield supabase
            .from('rsi_data')
            .insert([
            { rsi_value: mostRecentRSI, timestamp: new Date(mostRecentDate) }
        ]);
        if (error)
            throw error;
        console.log('RSI data updated:', data);
        return rsiValues;
    }
    catch (error) {
        console.error('Error updating RSI data:', error);
    }
});
exports.fetchAndStoreRSI = fetchAndStoreRSI;
