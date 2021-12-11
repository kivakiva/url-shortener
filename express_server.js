const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["secret-key-1", "secret-key-2"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const bcrypt = require('bcryptjs');

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
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
}

function generateRandomString() {
  return Math.random().toString(16).substring(2, 8)
}

function emailLookup(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
        return true
      }} return false
}

function filterUrlByUser(userID, database) {
  let newDatabase = {};
  for (entry in database) {
    if (database[entry].userID === userID) {
      newDatabase[entry] = database[entry];
    }
  }
  return newDatabase;
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
  const user = users[req.session.user_id];
  console.log('user:  ', user);
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
  res.render("urls_register", templateVars);
});

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
    } 
    req.session.user_id = id;
    console.log('user_id', id);
    res.redirect("/urls");

  } else {
    res.send("Error 404: email and password cannot be left blank")
  }
})

//GET login

app.get("/login", (req,res) => {
  const user = users[req.session.user_id]
  const templateVars = { user }
  res.render("login", templateVars)
} )

//POST login

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (let user in users) {
    console.log('email: ', email);
    console.log('user:  ', user)
    if (email === users[user].email && bcrypt.compareSync(password, users[user].hashPassword)) {
        //login
        //set cookie
        req.session.user_id = user;
        res.redirect("/urls/");
        return;
    }
  }
  if (emailLookup(email)) {
  res.send("403: Email and password do not match")
  return;
  }  else {
    res.send("403: User does not exist")
  }
})

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { 
    urls: urlDatabase,
    user
   };
   if (user) {
     res.render("urls_new", templateVars);
   } else {
    res.redirect('/login')
  }
});

//delete record

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = req.session.user_id;
  
  if (urlDatabase[shortURL].userID === user) {    
    delete urlDatabase[shortURL]
    res.redirect('/urls')
  } else {
    res.send("Error 403: You may only delete your own urls")
  }

})

//update longURL

app.post("/urls/update/:id", (req, res) => {
  const newlongURL = req.body.update;
  const shortURL = req.params.id;
  const user = req.session.user_id;
  console.log('newl:  ', newlongURL);
  console.log('short:  ', shortURL);
  urlDatabase[shortURL].longURL = newlongURL
  console.log("database id:", urlDatabase[shortURL].userID, "user from cookies: ", user)
  if (urlDatabase[shortURL].userID === user) {

    res.redirect('/urls')
  } else {
    res.send("Error 403: You may only edit your own urls")
  }


})

//login

app.post("/login", (req, res) => {
  const user_id = req.body.user_id;
  req.session.user_id = user_id;
  console.log(user_id);
  res.redirect('/urls/');
})

//logout

app.post("/logout", (req, res) => {
  const user_id = req.session.user_id
  req.session = null;
  res.redirect('/urls/');
})

// generate a new shorturl

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const short = generateRandomString();
    console.log(req.body.longURL)
    urlDatabase[short] = {
      longURL : req.body.longURL,
      userID : req.session.user_id
    }

    res.redirect(`/urls/${short}`);
  } else {
    res.send("403: You must be logged in to continue")
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.shortURL;
  const templateVars = 
  { user,
    shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
   };
     res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});