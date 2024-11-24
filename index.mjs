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

// conn.query(`TRUNCATE TABLE meal_plan;`);
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

app.get('/home', (req, res) => {    
    res.render('home.ejs');
});

app.get('/mealplan', async (req, res) => {
    let sql = `SELECT * FROM recipe`;
    const [rows] = await conn.query(sql);
    res.render('mealplan.ejs', {recipes: rows});
});

// Fetches the meal plan for the week
app.get('/mealplanweek', async (req, res) => {
    let date = new Date(req.query.date);
    let date2 = new Date(req.query.date);
    date.setDate(date.getDate() -1);
    date2.setDate(date2.getDate() + 7);
    let sql = `SELECT name, instructions, thumbnail, date, meal_type 
                FROM recipe
                NATURAL JOIN meal_plan
                WHERE user_id = 1 
                AND (date > ? AND date < ?)`; // change user_id to logged in user id
    const [rows] = await conn.query(sql, [date, date2]);
    console.log(rows);
    res.send(rows);
});

app.post('/mealplan', async (req, res) => {
        let recipe_id = req.query.recipe_id;
        let date = req.query.date;
        let user_id = req.query.user_id;
        let meal_type = req.query.meal_type;
        let sql = `INSERT INTO meal_plan (user_id, recipe_id, date, meal_type)
        VALUES (?,?,?,?)`;
        let sqlParams = [user_id,recipe_id,date,meal_type];
        const [rows]=await conn.query(sql, sqlParams);
        res.redirect('/mealplan');
});

app.get('/admin', async (req, res) => {
    let sql = `SELECT * FROM user`;
    const [rows] = await conn.query(sql);
    let sql2 = `SELECT * FROM recipe`;
    const [rows2] = await conn.query(sql2);
    let sql3 = `SELECT * FROM meal_plan`;
    const [rows3] = await conn.query(sql3);
    let sql4 = `SELECT * FROM ingredient`;
    const [rows4] = await conn.query(sql4);
    res.render('admin.ejs', {users: rows, recipes: rows2, meal_plans: rows3, ingredients: rows4});
});

app.post('/deletemealplan', async (req, res) => {
    let plan_id = req.body.plan_id;
    console.log('Received Plan ID to delete:', plan_id);

    if (!plan_id) {
        throw new Error('Invalid plan_id');
    }

    let sql = `DELETE FROM meal_plan WHERE plan_id = ?`;
    let sqlParams = [plan_id];
    await conn.query(sql, sqlParams);
    res.redirect('/admin');
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