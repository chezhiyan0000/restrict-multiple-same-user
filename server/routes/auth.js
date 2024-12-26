const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Status = require('../models/Status');

// Register Route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // const payload = { user: { id: user.id } };
        // jwt.sign(payload, config.jwtSecret, { expiresIn: 3600 }, async (err, token) => {
        //     if (err) throw err;
        //     const status = new Status({ username, token });
        //     await status.save();
        //     res.json({ token });
        // });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        let status = await Status.findOne({ username });
        if (status && status.token) {
            return res.status(403).json({ msg: 'User already logged in from another session' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, config.jwtSecret, { expiresIn: 3600 }, async (err, token) => {
            if (err) throw err;

            if (status) {
                status.token = token;
                await status.save();
            } else {
                status = new Status({ username, token });
                await status.save();
            }

            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Logout Route
router.post('/logout', async (req, res) => {
    const { username } = req.body;

    try {
        let status = await Status.findOne({ username });
        if (!status || !status.token) {
            return res.status(400).json({ msg: 'User is not logged in' });
        }

        await Status.deleteOne({ username });
        console.log("tokern deleted");

        res.json({ msg: 'User logged out successfully and token deleted' });
        console.log("logout succesfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
