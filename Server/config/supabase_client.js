// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js')
    // const { dotenv } = require('dotenv')
require('dotenv').config();
// import dotenv from "dotenv";
// dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
    // console.log(supabase)
module.exports = supabase
    // export default supabase;