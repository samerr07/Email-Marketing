const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase_client');

const adminLogin = async(req, res) => {
    const { email, password } = req.body;

    try {
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.hashed_password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id, role: 'admin' },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        return res.status(200).json({ token, role: 'admin' });
    } catch (err) {
        console.error('Admin login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const createUser = async(req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
        // Check if user already exists
        const { data: existingUser, errors } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user
        const { data: userdata, error } = await supabase
            .from('users')
            .insert([{
                name,
                email,
                hashed_password: hashedPassword,
                password
            }])
            .select();
        //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY5NmMxZDdlLTM4YmUtNGM5MS05NjZkLWRjYzliYjNjM2Y2MiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0ODA4MDUzOSwiZXhwIjoxNzQ4MDg0MTM5fQ.v6SvLQ7lCjpVexswaU4LKjUF2K031MentVwXHC2VZb8
        if (error) {
            return res.status(500).json({ message: 'Error creating user', error: error.message });
        }
        console.log(userdata)
        res.status(201).json({ message: 'User created successfully', user: userdata[0] });
    } catch (err) {
        console.error('User creation error:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};


module.exports = {
    adminLogin,
    createUser
};