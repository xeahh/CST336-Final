import express from 'express';
import mysql from 'mysql2/promise'; // npm i express ejs mysql2
import bcrypt from "bcrypt"; // make sure to do i bcrypt on fast comet terminal as well // npm i bcrypt
import session from 'express-session'; // npm i express-session
// npm i bcrypt


const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// initializing sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "justin-juarez.tech",
    user: "justinju_webuser",
    password: "CST-336",
    database: "justinju_meal",
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection();


// api spoonacular https://api.spoonacular.com/recipes/complexSearch?apiKey=17b87f4473434a9fab7d8268985d33c7



//routes
app.get('/', (req, res) => {
   res.render('landing.ejs');
});

app.get('/profile', (req, res) => {
    if(req.session.authenticated) {
        res.render('profile.ejs');
    } else {
        res.redirect('login.ejs');
    }
 });

 app.get('/home', isAuthenticated, (req, res) => {
    res.render('home.ejs');
 });

 app.get('/settings', isAuthenticated, (req, res) => {
    res.render('settings.ejs');
 });

 app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
 });

app.get('/login', (req, res) => {
    res.render('login.ejs');
 });

app.get('/signup', (req, res) => { 
    res.render('signup.ejs');
});
app.post('/signup/in', async(req, res) => { 
    let username = req.body.username;
    let password = req.body.password;
    console.log(username,password);

    let saltRounds = 10;
    let passcheck = 0;
    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(password, salt);

    let sql = `SELECT *
    FROM user 
    WHERE username = ?`;
    const [rows] = await conn.query(sql, [username]);
    console.log(rows.length);
    if(rows.length > 0) { 
        passcheck = 1; 
    }

    console.log("passcheck: "+passcheck);
    console.log("username/pass: "+username,hash);

    if(passcheck==0) {
        req.session.authenticated = true;
        let sql = `INSERT INTO user
                    (username, password)
                    VALUES
                    (?,?)`;
        const [new1] = await conn.query(sql, [username,hash]);
        console.log("run1");
        res.render('home.ejs');
    } else {
        res.redirect("signup.ejs");
    }
});
app.get('/home', (req, res) => {    
    res.render('home.ejs');
});

app.get('/mealplan', (req, res) => {
    res.render('mealplan.ejs');
});

app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    console.log(password);
    let passwordHash = "";
    // let match = await bcrypt.compare(password, passwordHash);
    // change admin to user likely
    let sql = `SELECT *
    FROM user 
    WHERE username = ?`;
    const [rows] = await conn.query(sql, [username]);
    if(rows.length > 0) { // if found at least one record
        passwordHash = rows[0].password; // always get an array when getting data from db
    }

    let match = await bcrypt.compare(password, passwordHash);

    if(match) {
        // req.session.fullName = rows[0].firstName + " " + rows[0].lastName;
        req.session.authenticated = true;
        res.render('home.ejs');
    } else {
        res.redirect("/");
    }
    // res.render('welcome.ejs');
 });

 app.get('/recipe/new', isAuthenticated, (req, res) => {
    res.render('newRecipe.ejs');
 });

 // to add recipes of your own // only authenticated users can add recipes
 app.post('/recipe/new', isAuthenticated, async (req, res) => {
    let name = req.body.name;
    let instructions = req.body.instructions;
    let picUrl = req.body.picture;

    let sql = `INSERT INTO recipe
    (name, instructions, thumbnail)
    VALUES
    (?,?,?)`;
    let sqlParams = [name, instructions, picUrl];
    const[rows] = await conn.query(sql, sqlParams);

    res.render('newRecipe.ejs');
});


app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});//dbTest

//Middleware Functions, to check if user is authenticated
function isAuthenticated(req, res, next) {
    if(req.session.authenticated) {
        next();
    } else {
        res.redirect("/");
    }
}

app.listen(3011, ()=>{
    console.log("Express server running")
})