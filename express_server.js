const express = require("express");
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

const methodOverride = require('method-override');

const { getUserByEmail, isInObj, generateRandomString, filterObj } = require('./helpers');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(cookieSession({
  name: 'session',
  keys: ["secret-key"],
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

const urlDatabase = {
};

const users = {
};

app.get("/", (req, res) => {
  let user = users[req.session.user_id];
  if (user) {
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
  if(!req.session.user_id) {
    return res.redirect("/login");
  }
  let userID = req.session.user_id;
  let filteredURLS = filterObj(urlDatabase, (shortURL) => urlDatabase[shortURL].userID === userID);
  let templateVars = { 
    user: users[req.session.user_id],
    urls: filteredURLS 
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
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
    urlDatabase,
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
  console.log(longURL);
  let user_id = req.session.user_id;
  if(!user_id){
    let newId = generateRandomString();
    req.session.user_id = newId;
  }
  urlDatabase[shortURL].visits += 1;
  let date = new Date().toJSON().slice(0,10).replace(/-/g,'/');
  if (!urlDatabase[shortURL].uniqueVisits.includes(user_id)) {
    urlDatabase[shortURL].uniqueVisits.push({ id: user_id, timeStamp: date });
  }
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
  let dateCreated = new Date().toJSON().slice(0,10).replace(/-/g,'/');
  urlDatabase[shortURL] = {longURL, dateCreated, visits: 0, uniqueVisits: [], userID: req.session['user_id']};
  res.redirect("/urls/" + shortURL);
});

app.put("/urls/:id", (req, res) => {
  let { id } = req.params;
  let { newLongURL } = req.body;
  if (req.session.user_id !== urlDatabase[id].userID) {
    return res.render("urls_error", {user: users[req.session.user_id], error: 401, errorMessage: "Unauthorized access."});
  }
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});

app.delete("/urls/:shortURL", (req, res) => {
  let { shortURL } = req.params;
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.render("urls_error", {user: users[req.session.user_id], error: 401, errorMessage: "Unauthorized access."});
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let { email, password } = req.body;
  let hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password || isInObj(users, (user) => user.email === email)) {
    return res.render("urls_error", {user: users[req.session.user_id], error: 400, errorMessage: "User already exists or User/Password field is empty"});
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
  if (!user) {
    return res.render("urls_error", {user: users[req.session.user_id], error: 403, errorMessage: "Invalid Email."});
  }
  let passwordsEqual = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordsEqual) {
    return res.render("urls_error", {user: users[req.session.user_id], error: 403, errorMessage: "Invalid Password."});
  } else {
    req.session.user_id = user.id;
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});