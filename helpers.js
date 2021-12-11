
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





module.exports = {
  generateRandomString,
  emailLookup,
  filterUrlByUser
};