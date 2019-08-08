const getUserByEmail = (users, userEmail) => {
  for(let user in users) {
    if(users[user].email === userEmail){
      return users[user];
    }
  }
  return undefined;
};

const generateRandomString = () => {
  const choices = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let tempStr = "";
  for(let i = 0; i < 6; i++){
    tempStr += choices.charAt(getRandomInt(choices.length));
  }
  return tempStr;
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

const isInObj = (obj, check) => {
  for(let item in obj){
    if(check(obj[item])){
      return true;
    }
  }
  return false;
};

const filterObj = (obj, check) => {
  const tempObj = {};
  for (let item in obj) {
    if(check(item)){
      tempObj[item] = obj[item];
    }
  }
  return tempObj;
};

module.exports = { getUserByEmail, generateRandomString, isInObj, filterObj };