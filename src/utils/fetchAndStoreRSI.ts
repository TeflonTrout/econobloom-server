import { SupabaseClient } from "@supabase/supabase-js";
import axios from "axios";

export const fetchAndStoreRSI = async (supabase:SupabaseClient, ALPHA_ADVANTAGE_API_KEY: string) => {
    try {
        const response = await axios.get(`https://www.alphavantage.co/query?function=RSI&symbol=ETHUSD&interval=daily&time_period=10&series_type=open&apikey=${ALPHA_ADVANTAGE_API_KEY}`)

        const rsiValues = response.data["Technical Analysis: RSI"];
        console.log(rsiValues)
        const mostRecentDate = Object.keys(rsiValues)[0];
        const mostRecentRSI = rsiValues[mostRecentDate].RSI;

        const { data, error } = await supabase
            .from('rsi_data')
            .insert([
                { rsi_value: mostRecentRSI, timestamp: new Date(mostRecentDate) }
            ]);

        if (error) throw error;

        console.log('RSI data updated:', data);
        return rsiValues
    } catch (error) {
        console.error('Error updating RSI data:', error);
    }
};