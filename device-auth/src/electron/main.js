const { systemPreferences } = require("electron");

systemPreferences
  .promptTouchID("To get consent for a Security-Gated Thing")
  .then((success) => {
    console.log("You have successfully authenticated with Touch ID!");
  })
  .catch((err) => {
    console.log(err);
  });
