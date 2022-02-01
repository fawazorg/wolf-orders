const { WOLFBot } = require("wolf.js");
const { createClient } = require("@supabase/supabase-js");
const api = new WOLFBot();
require("dotenv").config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = { api, supabase };

api.on("ready", async () => console.log("[*] - Orders start."));

api.login(process.env.EMAIL, process.env.PASSWORD);
