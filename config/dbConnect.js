const mongoose = require('mongoose');
const dbConnect = async () => {
    try{
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(`Connected to MongoDB: ${connect.connection.host}, ${connect.connection.name}`);
    }
    catch(err){
        console.log(`Error: ${err.message}`);
        process.exit(1);
    }
}
module.exports = dbConnect;