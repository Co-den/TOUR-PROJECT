const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('../../model/tourModel');
const User = require('../../model/userModel');
const Review = require('../../model/reviewModel');

//CONNECTING TO DB
mongoose.connect(process.env.DATABASE).then(() => {
    console.log('db connection successful');
});

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//IMPORT DATA INTO DB
//USING FUNCTION
const exportData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data succefully loaded!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

//DELETE EXISTING DATA IN THE DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Successfully deleted");
    } catch (err) {
        console.log(`Unsuccessful ${err}`);
    }
    process.exit();
}


//RUNNING OUR FUNCTION
if (process.argv[2] === '--import') {
    exportData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
