const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  return Math.random().toString(16).substring(2, 8)
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Tinyurl app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { 
    urls: urlDatabase,
    user
   };
  res.render("urls_index", templateVars);
});

//GET register

app.get("/urls/register", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { 
    urls: urlDatabase,
    user
   };
  res.render("urls_register", templateVars);
});

//POST register

app.post("/urls/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  users[id] = {
    email,
    password,
    id
  } 
  res.cookie('user_id', id);
  console.log(users);
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { 
    urls: urlDatabase,
    user
   };
  res.render("urls_new", templateVars);
});

//delete record

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]
  res.redirect('/urls')


})

//update longURL

app.post("/urls/update/:id", (req, res) => {
  const newlongURL = req.body.update;
  const shortURL = req.params.id;
  console.log('newl:  ', newlongURL);
  console.log('short:  ', shortURL);
  urlDatabase[shortURL] = newlongURL
  console.log(urlDatabase)
  res.redirect('/urls')


})

//login

app.post("/login", (req, res) => {
  const user_id = req.body.user_id;
  res.cookie('user_id', user_id)
  console.log(user_id);
  res.redirect('/urls/');
})

//logout

app.post("/logout", (req, res) => {
  const user_id = req.cookies.user_id
  res.clearCookie('user_id', user_id)
  res.redirect('/urls/');
})

// generate a new shorturl

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  console.log(req.body);
  res.redirect(`/urls/${short}`);
});


app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = 
  { user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});