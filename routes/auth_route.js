const express = require('express'); 
const router = express.Router(); 
const usermodel = require('../models/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const User=require('../models/user');
const path=require('path');





router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.static(path.join(__dirname,'public')));


router.get('/login', (req, res) => {
    res.render('login');
});


router.get('/signup', (req, res) => {
    res.render('signup');
});



router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, phone_number, confirm_password, role } = req.body;

        
        let user = await usermodel.findOne({ email });
        if (user) {
            return res.status(400).send('Email already exists');
        }

       
        user = await usermodel.findOne({ phone: phone_number });
        if (user) {
            return res.status(400).send('Phone number already exists');
        }

        
        if (password !== confirm_password) {
            return res.status(400).send('Passwords do not match!');
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        user = await usermodel.create({
            name: username,
            phone: phone_number,
            email,
            password: hashedPassword,
            role, 
        });

        
        const token = jwt.sign(
            {
                email: user.email,
                name: user.name,
                userId: user._id,
                role: user.role, 
            },
            "shhxcvjhu", 
            { expiresIn: "24h" }
        );

       
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000, 
        });

     
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    try {
        let user = await usermodel.findOne({ email });
        if (!user) {
            return res.redirect('/auth/signup');
        }

        bcrypt.compare(password, user.password, (err, result) => {
            

            if (result) {
                let token = jwt.sign({
                    email: email,
                    userId: user._id,
                    name: user.name,
                    role:user.role,
                }, "shhxcvjhu");
                res.cookie("token", token);
                
                res.redirect('/');
            } else {
                res.status(401).render("login", { error: "Invalid email or password" });
            }
        });
    } catch (error) {
        console.error("Error during sign-in:", error);
        res.status(500).render("signin", { error: "Internal Server Error" });
    }
});




router.get('/logout', (req, res) => {
    res.clearCookie('token'); 
    res.redirect('/auth/login');        
});





function isloggedin(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        console.log("No token found.");
        req.user = null;
        res.redirect('/auth/login');
    }

    try {
        const data = jwt.verify(token, 'shhxcvjhu'); 
        req.user = data;
        console.log("Token verified. User:", req.user);
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        req.user = null;
        next(); 
    }
}


module.exports = router;
