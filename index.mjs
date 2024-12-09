import express from 'express';
import fetch from 'node-fetch';
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


app.get('/recipe/meal/:mealId', async (req, res) => {
    let mealId = req.params.mealId;
    let sql =  `SELECT *
                FROM recipe
                WHERE name = ? ` ;
    let sqlParams = [mealId];
    const [rows] = await conn.query(sql, sqlParams);
    res.send(rows);
 });
//routes
app.get('/', (req, res) => {
    if(req.session.authenticated) {
        res.render('home.ejs', {username: req.session.username, picture: req.session.picture, isAdmin: req.session.admin});
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
    res.render('home.ejs', {username: req.session.username, picture: req.session.picture, isAdmin: req.session.admin});
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

// app.get('/recipes',isAuthenticated, (req, res) => {
//     res.render('recipes.ejs', {picture: req.session.picture});
// })
app.get('/groceryList',isAuthenticated, async(req, res) => {
    let id = req.session.userid;
    let date = new Date();
    date = date.toLocaleDateString();
    date = new Date(date);

    let sql = `SELECT * FROM meal_plan WHERE user_id = ? AND date = ?`;
    const [rows] = await conn.query(sql,[id,date]);

    let allmeal = []
    for(let row of rows){
        allmeal.push(row.recipe_id)
    }

    let ingredients = []

    if(rows.length>0){
        for(let i of allmeal){
            let sql = `SELECT name FROM recipe WHERE recipe_id = ?`;
            const [name1] = await conn.query(sql,[i]);

            let url="http://www.themealdb.com/api/json/v1/1/search.php?s="+name1[0].name;
            let response2= await fetch(url);
            let data= await response2.json();
            data.meals.filter(obj => {
                for (let key in obj) {
                if(obj[key]===null){
                    console.log("here")
                }
                else{
                  if (key.startsWith("strIngredient")) {
                    if(obj[key].length>0){
                    if (!ingredients.includes(obj[key])) {
                        ingredients.push(obj[key]);
                            }
                        } 
                  }
                }
                }
                return false;
              });

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
    // const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    // let nowMonth = months[month-1]
    // console.log(months[month-1])
    res.render('groceryList.ejs',{uniqueIngredients, picture: req.session.picture, isAdmin: req.session.admin, username: req.session.username});

});
// app.get('/recipes', (req, res) => {
//     res.render('recipes.ejs');
// });


app.get('/mealplan', isAuthenticated, async (req, res) => {
    let sql = `SELECT * FROM recipe`;
    const [rows] = await conn.query(sql);
    res.render('mealplan.ejs', {username: req.session.username,recipes: rows, picture: req.session.picture, isAdmin: req.session.admin});
});

app.get('/recipe', isAuthenticated, async (req, res) => {
    let recipe_id = req.query.recipe_id;
    let sql = `SELECT * FROM recipe WHERE recipe_id = ?`;
    const [rows] = await conn.query(sql, [recipe_id]);
    res.send(rows[0]);
});


app.get('/recipes', isAuthenticated, async (req, res) => {
    let sql = `SELECT *
                FROM recipe 
                ORDER BY name`;
    const [rows] = await conn.query(sql);

    /**
     * The query joins the `favorite_recipe` table with the `recipe` table
     * to retrieve all columns from the `recipe` table for the recipes
     * that are favorited by the user with the given user ID.
     */
    let sql2 = `SELECT r.*
                FROM favorite_recipe fr
                JOIN recipe r ON fr.recipe_id = r.recipe_id
                WHERE fr.user_id = ?;`;

    const [favorites] = await conn.query(sql2, [req.session.userid]);
    
    // console.log(favorites);
    res.render('recipes.ejs',{username: req.session.username,rows,picture: req.session.picture, favorites, isAdmin: req.session.admin});
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
    res.send(rows);
});

app.get('/admin', isAdmin,async (req, res) => {
    let sql = `SELECT * FROM user`;
    const [rows] = await conn.query(sql);
    let sql2 = `SELECT * FROM recipe`;
    const [rows2] = await conn.query(sql2);
    let sql3 = `SELECT * FROM meal_plan`;
    const [rows3] = await conn.query(sql3);
    let sql4 = `SELECT * FROM favorite_recipe`;
    const [rows4] = await conn.query(sql4);
    res.render('admin.ejs', {users: rows, recipes: rows2, meal_plans: rows3, fav: rows4, picture: req.session.picture, isAdmin: req.session.admin});
});

app.get('/recipe/new', isAuthenticated, (req, res) => {
    res.render('newRecipe.ejs', {username: req.session.username,picture: req.session.picture, isAdmin: req.session.admin});
 });

// Post requests
// Updated signup, can now create new user from sign up as intended
app.post('/signup', async(req, res) => { 
    let username = req.body.username;
    let password = req.body.password;

    let saltRounds = 10;
    let passcheck = 0;
    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(password, salt);

    let sql = `SELECT *
    FROM user 
    WHERE username = ?`;
    const [rows] = await conn.query(sql, [username]);
    if(rows.length > 0) { 
        passcheck = 1; 
    }


    if(passcheck==0) {
        req.session.authenticated = true;
        req.session.username = username;

        let sql = `INSERT INTO user
                    (username, password)
                    VALUES
                    (?,?)`;
        const [new1] = await conn.query(sql, [username,hash]);
        
        // works but need to get user_id
        let sql2 = `SELECT user_id FROM user WHERE username = ?`;
        const [newUser] = await conn.query(sql2, [username]);
        req.session.userid = newUser[0].user_id;

        const imageUrl = await getRandomFoodImage(); // get random pfp img when signing up
        req.session.picture = imageUrl;
        res.render('home.ejs', {username: req.session.username, picture: req.session.picture,isAdmin: req.session.admin});
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

    if (!plan_id) {
        throw new Error('Invalid plan_id');
    }

    let sql = `DELETE FROM meal_plan WHERE plan_id = ?`;
    let sqlParams = [plan_id];
    await conn.query(sql, sqlParams);
    res.redirect(req.get('referer'));
});
app.post('/deleteFavMeal',isAuthenticated,async (req, res) => {
    let recipe_id = req.body.recipe_id;

    if (!recipe_id) {
        throw new Error('Invalid recipe_id');
    }

    let sql = `DELETE FROM favorite_recipe WHERE recipe_id = ?`;
    let sqlParams = [recipe_id];
    await conn.query(sql, sqlParams);
    res.redirect(req.get('referer'));
});
app.post('/addFavMeal',isAuthenticated,async (req, res) => {
    let user_id = req.session.userid;
    let recipe_id = req.body.recipe_id;

    let sql2 = `SELECT * FROM favorite_recipe WHERE recipe_id = ?`;
    let sqlParam2 = [recipe_id];
    const [rows] = await conn.query(sql2, sqlParam2);
    if(rows.length>0){
        res.redirect(req.get('referer'));
    }else{
       if (!recipe_id) {
        throw new Error('Invalid recipe_id');
    }
    
    let sql = `INSERT INTO favorite_recipe
    (user_id, recipe_id)
    VALUES
    (?,?)`;
    let sqlParams = [user_id,recipe_id];
    await conn.query(sql, sqlParams);
    res.redirect(req.get('referer')); 
    }
});
app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    username = username.toLowerCase();
    
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
        const imageUrl = await getRandomFoodImage();
        if (username == "admin" || username == "testadmin") {
            req.session.admin = true;
        }
        req.session.authenticated = true;
        req.session.username = username;
        req.session.userid = rows[0].user_id;
        req.session.picture = imageUrl;
        console.log("user id: "+req.session.userid)
        res.render('home.ejs', {username: req.session.username, picture: req.session.picture, isAdmin: req.session.admin});
    } else {
        res.redirect("/login");
    }
    // res.render('welcome.ejs');
 });

 // to add recipes of your own // only authenticated users can add recipes
 app.post('/recipe/new', isAuthenticated, async (req, res) => {
    let name = req.body.name;
    let instructions = req.body.instructions;
    let picUrl = req.body.thumbnail;

    let sql = `INSERT INTO recipe
    (name, instructions, thumbnail)
    VALUES
    (?,?,?)`;
    let sqlParams = [name, instructions, picUrl];
    const[rows] = await conn.query(sql, sqlParams);

    res.render('newRecipe.ejs', {username: req.session.username,picture: req.session.picture,isAdmin: req.session.admin});
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

// check if user is an admin
function isAdmin(req, res, next) {
    if(req.session.authenticated && req.session.admin) {
        next();
    } else {
        res.redirect("/");
    }
}
// function to get random food image
async function getRandomFoodImage() {
    const response = await fetch('https://foodish-api.com/api/');
    const data = await response.json();
    return data.image;
}

app.get('/random/food', async (req, res) => {
    const imageUrl = await getRandomFoodImage();
    res.render('randomFood.ejs', { imageUrl });
});

app.listen(3011, ()=>{
    console.log("Express server running on port 3011");
})