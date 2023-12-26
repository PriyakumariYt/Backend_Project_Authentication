
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const hbs = require('hbs');
const conn = require('./database/connection'); 
const bcrypt = require("bcrypt")
 const jwt = require("jsonwebtoken")
// Assuming that 'conn.js' is your database connection file
const Email = require('./models/userEmail');
const Register = require("./models/register")
const auth = require("./middleware/auth");

const templatePath = path.join(__dirname, '../templates/views');
const partialPath = path.join(__dirname, '../templates/partials');
const staticPath = path.join(__dirname, '../public');
// middle ware

app.use(cookieParser());
app.use(express.static(staticPath));
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'hbs');
app.set('views', templatePath);
hbs.registerPartials(partialPath);

app.get('/', (req, res) => {
  res.render('index');
});
// REGISTER PAGE
app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', async (req, res) => {
  try {
    console.log(req.body)
    const data = new Register(req.body);
    const token = await data.generateToken();
    console.log("the register token part", token);
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 500000),
      httpOnly: true
    });
    console.log(`registered..... cookies ${req.cookies.jwt}`);
    res.status(201).render('login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send(error.message);
  }
});

// LOGIN PAGE
app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userEmail = await Register.findOne({ email: email });
    if (!userEmail) {
      return res.status(400).send("Invalid email");
    }
    const isMatch = await bcrypt.compare(password, userEmail.password);
    if (isMatch) {
      const token = await userEmail.generateToken();
      console.log("the login token part", token);
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 500000),
        httpOnly: true,
        // secure: true
      });
      console.log(`login cookies..... ${req.cookies.jwt}`);
      res.status(201).render("index");
    } else {
      res.status(401).send("Invalid password details");
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send(error.message);
  }
});
// LOGOUT FUNCTIONALITY
app.get('/logout', auth, async(req, res) => {
  try {
    console.log(`this is user data ${req.user}`)
    // delete token in one device 
    // req.user.tokens =req.user.tokens.filter((CurrElem)=>{
    //   return CurrElem.token !== req.token
    // })
    // DELETE ALL TOKEN IN ONE TIME 
    req.user.tokens = [];
    res.clearCookie("jwt")
    console.log("logout succesfully")
   await req.user.save()
   res.render("login")
  } catch (error) {
    res.status(500).send(error)
  }
  });

  
app.get('/about', (req, res) => {
  res.render('about');
});
app.get('/contact', (req, res) => {
  res.render('contact');
});
app.get('/service',auth, (req, res) => {
  res.render('service');

});
app.get('/blog', (req, res) => {
  res.render('blog');
});
// add this part
app.post('/footer', async (req, res) => {
  console.log('Received form data:', req.body);
  try {
    const userEmail = new Email(req.body);
     const userData = await userEmail.save();
    console.log('Data saved successfully:', userData);
    res.status(201).render('index');
    // res.send(req.body)
  } catch (error) {
    console.error('Error saving data:', error); // Log the specific error
    res.status(500).send(error);
  }
});

app.listen(5500, () => {
  console.log('Server is running on port 5500');
});
