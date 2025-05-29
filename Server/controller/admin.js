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


const updateUser = async (req, res) => {
    const { id } = req.params; // Get user ID from URL parameters
    const { email, password, name } = req.body;

    // Validate user ID
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if at least one field is provided for update
    if (!email && !password && !name) {
        return res.status(400).json({ message: 'At least one field (name, email, or password) is required for update' });
    }

    try {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', id)
            .single();

        if (fetchError || !existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If email is being updated, check if new email already exists
        if (email && email !== existingUser.email) {
            const { data: emailExists } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (emailExists) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Prepare update object
        const updateData = {};
        
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        
        // Hash password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.hashed_password = hashedPassword;
            updateData.password = password; // Keep plain password if needed
        }

        // Update the user
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select();

        if (updateError) {
            return res.status(500).json({ 
                message: 'Error updating user', 
                error: updateError.message 
            });
        }

        if (!updatedUser || updatedUser.length === 0) {
            return res.status(404).json({ message: 'User not found or update failed' });
        }

        console.log('Updated user:', updatedUser);
        res.status(200).json({ 
            message: 'User updated successfully', 
            user: updatedUser[0] 
        });

    } catch (err) {
        console.error('User update error:', err);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: err.message 
        });
    }
};


module.exports = {
    adminLogin,
    createUser,
    updateUser
};