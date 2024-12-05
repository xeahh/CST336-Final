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
    if(req.session.authenticated) {
        res.render('home.ejs', {username: req.session.username});
    } else {
        res.render('landing.ejs');
    }
});

app.get('/profile',isAuthenticated, (req, res) => {
    if(req.session.authenticated) {
        res.render('profile.ejs');
    } else {
        res.redirect('login.ejs');
    }
 });

 app.get('/home', isAuthenticated, (req, res) => {
    res.render('home.ejs', {username: req.session.username});
 });

 app.get('/settings', isAuthenticated, (req, res) => {
    res.render('settings.ejs');
 });

 app.get('/logout', isAuthenticated,(req, res) => {
    req.session.destroy();
    res.redirect('/');
 });

app.get('/login', (req, res) => {
    res.render('login.ejs');
 });

app.get('/signup', (req, res) => { 
    res.render('signup.ejs');
});

app.get('/groceryList',isAuthenticated, async(req, res) => {
    let id = req.session.userid;

    let sql = `SELECT * FROM meal_plan WHERE user_id = ?`;
    const [rows] = await conn.query(sql,[id]);

    let ingredients = []

    if(rows.length>0){
        for(let i=0;i<rows.length;i++){
            let sql = `SELECT name FROM recipe WHERE recipe_id = ?`;
            const [name1] = await conn.query(sql,[rows[i].recipe_id]);

            let url="http://www.themealdb.com/api/json/v1/1/search.php?s="+name1[0].name;
            let response2= await fetch(url);
            let data= await response2.json();

            if(data.meals[0].strIngredient1.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient1)) {
                    ingredients.push(data.meals[0].strIngredient1);
                }
            } if(data.meals[0].strIngredient2.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient2)) {
                    ingredients.push(data.meals[0].strIngredient2);
                }
            }if(data.meals[0].strIngredient3.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient3)) {
                    ingredients.push(data.meals[0].strIngredient3);
                }
            }if(data.meals[0].strIngredient4.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient4)) {
                    ingredients.push(data.meals[0].strIngredient4);
                }
            }if(data.meals[0].strIngredient5.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient5)) {
                    ingredients.push(data.meals[0].strIngredient5);
                }
            }
            if(data.meals[0].strIngredient6.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient6)) {
                    ingredients.push(data.meals[0].strIngredient6);
                }
            } if(data.meals[0].strIngredient7.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient7)) {
                    ingredients.push(data.meals[0].strIngredient7);
                }
            }if(data.meals[0].strIngredient8.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient8)) {
                    ingredients.push(data.meals[0].strIngredient8);
                }
            }if(data.meals[0].strIngredient9.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient9)) {
                    ingredients.push(data.meals[0].strIngredient9);
                }
            }if(data.meals[0].strIngredient10.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient10)) {
                    ingredients.push(data.meals[0].strIngredient10);
                }
            }
            if(data.meals[0].strIngredient11.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient11)) {
                    ingredients.push(data.meals[0].strIngredient11);
                }
            } if(data.meals[0].strIngredient12.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient12)) {
                    ingredients.push(data.meals[0].strIngredient12);
                }
            }if(data.meals[0].strIngredient13.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient13)) {
                    ingredients.push(data.meals[0].strIngredient13);
                }
            }if(data.meals[0].strIngredient14.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient14)) {
                    ingredients.push(data.meals[0].strIngredient14);
                }
            }if(data.meals[0].strIngredient15.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient15)) {
                    ingredients.push(data.meals[0].strIngredient15);
                }
            }
            if(data.meals[0].strIngredient16.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient16)) {
                    ingredients.push(data.meals[0].strIngredient16);
                }
            } if(data.meals[0].strIngredient17.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient17)) {
                    ingredients.push(data.meals[0].strIngredient17);
                }
            }if(data.meals[0].strIngredient18.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient18)) {
                    ingredients.push(data.meals[0].strIngredient18);
                }
            }if(data.meals[0].strIngredient19.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient19)) {
                    ingredients.push(data.meals[0].strIngredient19);
                }
            }if(data.meals[0].strIngredient20.length>0){
                if (!ingredients.includes(data.meals[0].strIngredient20)) {
                    ingredients.push(data.meals[0].strIngredient20);
                }
            }
        }
    }
    let seen = new Set();
    let uniqueIngredients = ingredients.filter(item => {
    let lower = item.toLowerCase();
    if (!seen.has(lower)) {
        seen.add(lower);
        return true;
        }
        return false;
    });
    console.log(uniqueIngredients);


    res.render('groceryList.ejs',{uniqueIngredients});
});


// app.get('/recipes', (req, res) => {
//     res.render('recipes.ejs');
// });



app.get('/home', isAuthenticated, (req, res) => {    
    res.render('home.ejs');
});

app.get('/mealplan', isAuthenticated, async (req, res) => {
    let sql = `SELECT * FROM recipe`;
    const [rows] = await conn.query(sql);
    res.render('mealplan.ejs', {recipes: rows});
});

app.get('/recipes', isAuthenticated, async (req, res) => { //pulls all recipes from database to display on recipes page
    // let recipe_id = req.query.recipe_id;
    let sql = `SELECT name
                FROM recipe 
                ORDER BY name`;
    const [rows] = await conn.query(sql);
 
    res.render('recipes.ejs',{rows});
});

// Fetches the meal plan for the week
app.get('/mealplanweek', isAuthenticated, async (req, res) => {
    let date = new Date(req.query.date);
    let date2 = new Date(req.query.date);
    date.setDate(date.getDate() -1);
    date2.setDate(date2.getDate() + 7);
    let sql = `SELECT name, instructions, thumbnail, plan_id, recipe_id, date, meal_type 
                FROM recipe
                NATURAL JOIN meal_plan
                WHERE user_id = ? 
                AND (date > ? AND date < ?)`; // change user_id to logged in user id
    const [rows] = await conn.query(sql, [req.session.userid,date, date2]);
    console.log("meal:"+rows[0])
    res.send(rows);
});

app.get('/admin', isAuthenticated,async (req, res) => {
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

app.get('/recipe/new', isAuthenticated, (req, res) => {
    res.render('newRecipe.ejs');
 });

// Post requests

app.post('/signup', async(req, res) => { 
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
        req.session.username = username;
        req.session.userid = rows[0].user_id;
        let sql = `INSERT INTO user
                    (username, password)
                    VALUES
                    (?,?)`;
        const [new1] = await conn.query(sql, [username,hash]);
        console.log("run1");
        res.render('home.ejs', {username: req.session.username});
    } else {
        res.redirect("/signup");
    }
});

app.post('/mealplan', isAuthenticated,async (req, res) => {
        let recipe_id = req.query.recipe_id;
        let date = req.query.date;
        let meal_type = req.query.meal_type;
        let user_id = req.session.userid;
        let sql = `INSERT INTO meal_plan (user_id, recipe_id, date, meal_type)
        VALUES (?,?,?,?)`;
        let sqlParams = [user_id,recipe_id,date,meal_type];
        const [rows]=await conn.query(sql, sqlParams);
        res.redirect('/mealplan');
});

app.post('/deletemealplan',isAuthenticated,async (req, res) => {
    let plan_id = req.body.plan_id;
    console.log('Received Plan ID to delete:', plan_id);

    if (!plan_id) {
        throw new Error('Invalid plan_id');
    }

    let sql = `DELETE FROM meal_plan WHERE plan_id = ?`;
    let sqlParams = [plan_id];
    await conn.query(sql, sqlParams);
    res.redirect(req.get('referer'));
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
        req.session.username = username;
        req.session.userid = rows[0].user_id;
        console.log("user id: "+req.session.userid)
        res.render('home.ejs', {username: req.session.username});
    } else {
        res.redirect("/login");
    }
    // res.render('welcome.ejs');
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
    console.log("Express server running on port 3011");
})