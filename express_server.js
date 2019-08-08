const express = require("express");
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

const { getUserByEmail, isInObj, generateRandomString, filterObj } = require('./helpers');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["secret-key"],
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  let user = users[req.session.user_id];
  if(user){
    return res.redirect("urls");
  }
  return res.redirect("/login");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  }
  return res.render("urls_register", templateVars);
});

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  let filteredURLS = filterObj(urlDatabase, (shortURL) => urlDatabase[shortURL].userID === userID);
  let templateVars = { 
    user: users[req.session.user_id],
    urls: filteredURLS 
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if(!req.session.user_id){
    return res.redirect("/login");
  }
  let templateVars = {
    user: users[req.session.user_id]
  }
  return res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let { shortURL } = req.params;
  let templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id]
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
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  }
  return res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let { longURL } = req.body;
  urlDatabase[shortURL] = {longURL, userID: req.session['user_id']};
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id", (req, res) => {
  let { id } = req.params;
  let { newLongURL } = req.body;
  if(req.session.user_id !== urlDatabase[id].userID){
    return res.status(401).send("Unauthorized access.");
  }
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let { shortURL } = req.params;
  if(req.session.user_id !== urlDatabase[shortURL].userID){
    return res.status(401).send("Unauthorized access.");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let { email, password } = req.body;
  let hashedPassword = bcrypt.hashSync(password, 10);
  if(!email || !password || isInObj(users, (user) => user.email === email)){
    return res.status(400).send("User already exists or User/Password field is empty");
  }
  let newId = generateRandomString();
  users[newId] = {
    email,
    password: hashedPassword,
    id: newId
  }
  req.session.user_id = newId;
  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let user = getUserByEmail(users, req.body.email);
  let passwordsEqual = bcrypt.compareSync(req.body.password, user.password);
  if(!user || !passwordsEqual){
    return res.status(403).send("Invalid Email or Password");
  }else{
    req.session.user_id = user.id;
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});