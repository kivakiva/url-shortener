//imports

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["secret-key-1", "secret-key-2"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const bcrypt = require('bcryptjs');

const {generateRandomString, emailLookup, filterUrlByUser} = require('./helpers.js');

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  aaa: {
    longURL: "https://www.google.ca",
    userID: "bcw123"
  }
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
};


app.listen(PORT, () => {
  console.log(`Tinyurl app listening on port ${PORT}!`);
});

//GET homepage

app.get("/", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls");

  } else {
    res.redirect("/login");
  }});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET redirect from short to long

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const redirectURL = urlDatabase[shortURL].longURL;

  res.redirect(redirectURL);
});

//GET user's urls

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    urls: filterUrlByUser(req.session.user_id, urlDatabase),
    user
  };
  res.render("urls_index", templateVars);
});

//GET register

app.get("/register", (req, res) => {

  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  };

  if (user) {
    res.send("Error 403: You are already logged in")
    
  } else {
  res.render("urls_register", templateVars);
  }});

//POST register

app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10);

  if (emailLookup(email, users)) {
    res.send("Error 404: An account already exists for this email");

  } else if (email && password) {
    const id = generateRandomString();
    users[id] = {
      email,
      hashPassword,
      id
    };
    req.session.user_id = id;
    res.redirect("/urls");

  } else {
    res.send("Error 404: email and password cannot be left blank");
  }
});

//GET login

app.get("/login", (req,res) => {

  const user = users[req.session.user_id];

  if (user) {
    res.send("Error 403: You are already logged in")

  } else {
    const templateVars = { user };
    res.render("login", templateVars);
  }});

//POST login

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  for (let user in users) {

    if (email === users[user].email && bcrypt.compareSync(password, users[user].hashPassword)) {
      req.session.user_id = user;
      res.redirect("/urls/");
      return;
    }
  }

  if (emailLookup(email, users)) {
    res.send("403: Email and password do not match");
    return;

  }  else {
    res.send("403: User does not exist");
  }
});

//POST logout

app.post("/logout", (req, res) => {

  req.session = null;

  res.redirect('/urls/');
});

//GET new url page

app.get("/urls/new", (req, res) => {

  const user = users[req.session.user_id];
  const templateVars = {
    user,
    urls: urlDatabase
  };

  if (user) {
    res.render("urls_new", templateVars);

  } else {
    res.redirect('/login');
  }
});

//POST delete existing url

app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL = req.params.shortURL;
  const user = req.session.user_id;

  if (urlDatabase[shortURL].userID === user) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');

  } else {
    res.send("Error 403: You may only delete your own urls");
  }
});

//POST update existing url

app.post("/urls/:id", (req, res) => {

  const newlongURL = req.body.update;
  const shortURL = req.params.id;
  const user = req.session.user_id;
  urlDatabase[shortURL].longURL = newlongURL;

  if (urlDatabase[shortURL].userID === user) {

    res.redirect('/urls');

  } else {
    res.send("Error 403: You may only edit your own urls");
  }
});

// POST create new url

app.post("/urls", (req, res) => {

  const user = users[req.session.user_id];

  if (user) {

    const short = generateRandomString();
    urlDatabase[short] = {
      longURL : req.body.longURL,
      userID : req.session.user_id
    };

    res.redirect(`/urls/${short}`);

  } else {

    res.send("403: You must be logged in to continue");
  }
});

//GET view existing url

app.get("/urls/:shortURL", (req, res) => {

  const user = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.send("403: This short url does not exist")
  } else {
    const templateVars =
    { user,
      shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
  
    res.render("urls_show", templateVars);
  }

});