const express = require('express');
const supabase = require('../config/supabase_client');
const { adminLogin, createUser, updateUser } = require('../controller/admin');
const { userLogin, getUsers, deleteUser } = require('../controller/user');
const { authenticate, authorizeAdmin } = require('../middleware/middleware')

const router = express.Router();

router.post('/login', async(req, res) => {
    const { email } = req.body;

    try {
        // Check if the email belongs to an admin
        const { data: admin, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (admin && !adminError) {
            return adminLogin(req, res);
        }

        // Else, handle as user login
        return userLogin(req, res);
    } catch (error) {
        console.error('Login route error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
// router.post("/create_user", authenticate, authorizeAdmin, createUser)
router.post("/create_user",  createUser)

router.get('/users', getUsers);

router.put('/update_user/:id', updateUser);

router.delete('/users/:id', deleteUser);
module.exports = router;