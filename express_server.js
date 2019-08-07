const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user"]]
  }
  return res.render("urls_register", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase 
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if(!req.cookies["user_id"]){
    return res.redirect("/login");
  }
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  return res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let { shortURL } = req.params;
  let templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL],
    user: users[req.cookies["user_id"]]
  };

  return res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  let { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  return res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let { longURL } = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id", (req, res) => {
  let { id } = req.params;
  let { newLongURL } = req.body;
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let { email, password } = req.body;

  if(!email || !password || isInObj(users, (user) => user.email === email)){
    return res.status(400).send("User already exists or User/Password field is empty");
  }

  let newId = generateRandomString();
  users[newId] = {
    email,
    password,
    id: newId
  }

  res.cookie("user_id", newId);
  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let user = findUser(users, req.body.email);
  if(!user || user.password !== req.body.password){
    return res.status(403).send("Invalid Email or Password");
  }else{
    res.cookie("user_id", user.id);
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  const choices = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let tempStr = "";
  for(let i = 0; i < 6; i++){
    tempStr += choices.charAt(getRandomInt(choices.length));
  }
  return tempStr;
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

const isInObj = (obj, check) => {
  for(let item in obj){
    if(check(obj[item])){
      return true;
    }
  }
  return false;
}

const findUser = (users, userEmail) => {
  for(let user in users) {
    if(users[user].email === userEmail){
      return users[user];
    }
  }
  return {};
}