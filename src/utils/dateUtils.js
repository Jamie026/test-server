const moment = require("moment");

// Obtener la fecha del día anterior en formato YYYY-MM-DD
function getYesterdayDate() {
  let day = moment().subtract(1, "days").format("YYYY-MM-DD");
  console.log(day);
  return day
}

//getYesterdayDate();

module.exports = { getYesterdayDate };
