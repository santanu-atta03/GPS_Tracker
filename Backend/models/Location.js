const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    busID : {
        type:String,
        required:true,
    },
    route : {
        type : String,

    },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: [Number],
    },
    lastUpdated : {
        type : Date,
        default : Date.now(),
    }
});

module.exports = mongoose.model("Loacation",busSchema);