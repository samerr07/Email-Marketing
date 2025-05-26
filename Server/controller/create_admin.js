const supabase = require('../config/supabase_client');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createAdmin = async() => {
    const email = 'admin@example.comssssssssssss';
    const plainPassword = '1234';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const { data, error } = await supabase
        .from('admins')
        .insert([{ email, hashed_password: hashedPassword }])
        .select();

    if (error) console.error(error);
    else console.log('Admin created:', data);
};

createAdmin();