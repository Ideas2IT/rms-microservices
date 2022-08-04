const moment = require("moment");

/**
 * @name isDateBefore
 * @description To compare the date with another date to check whether it's before or not
 * @param {datetime} date1 
 * @param {datetime} date2 
 * @returns {boolean}
 */
const isDateBefore = (date1, date2) => {
  return moment(new Date(date1)).isBefore(new Date(date2));
};

/**
 * @name isDateAfter
 * @description To compare the date with another date to check whether it's after or not
 * @param {datetime} date1 
 * @param {datetime} date2 
 * @returns {boolean}
 */
const isDateAfter = (date1, date2) => {
  return moment(new Date(date1)).isAfter(new Date(date2));
};

/**
 * @name addTenMinsToNow
 * @description To add 10mins to current date and time
 * @returns {datetime}
 */
const addTenMinsToNow = () => {
  const now = new Date();
  return new Date(now.setMinutes(now.getMinutes()+10));
}

module.exports = {
  isDateBefore,
  isDateAfter,
  addTenMinsToNow
};