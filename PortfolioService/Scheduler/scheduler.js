const schedule = require('node-schedule');

const scheduledJobs = () => {
    // Schedule hourly task
    const hourlyTask = schedule.scheduleJob('0 * * * * *', () => console.log("updateHourly", new Date().toLocaleString()));

    // Schedule daily task
    const dailyTask = schedule.scheduleJob('0 0 * * *', () =>  console.log("updateDaily"));

    // Schedule weekly task
    const weeklyTask = schedule.scheduleJob('0 0 * * 0', () =>  console.log("updateWeekly"));
};

module.exports = scheduledJobs;


