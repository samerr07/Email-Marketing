const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase_client');

const userLogin = async(req, res) => {
    const { email, password } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.hashed_password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: 'user' },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        return res.status(200).json({ 
            token, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: 'user'
            }});
    } catch (err) {
        console.error('User login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('name, email, created_at,id')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ message: 'Failed to fetch users' });
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        return res.status(200).json({
            message: 'Users retrieved successfully',
            data: users,
            count: users.length
        });

    } catch (err) {
        console.error('Get users error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate if ID is provided
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // First, check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('id', id)
            .single();

        if (fetchError || !existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
            return res.status(500).json({ message: 'Failed to delete user' });
        }

        return res.status(200).json({ 
            message: 'User deleted successfully',
            deletedUser: {
                id: existingUser.id,
                email: existingUser.email,
                name: existingUser.name
            }
        });

    } catch (err) {
        console.error('Delete user error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};




module.exports = {
    userLogin, getUsers, deleteUser
};