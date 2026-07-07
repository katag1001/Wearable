const mongoose = require("mongoose");

/* -------------------- USER -------------------- */

const userSchema = new mongoose.Schema(
{
email: { type: String, unique: true, required: true },
password: { type: String, required: true },
},
{ strictQuery: false }
);

/* -------------------- MATCH -------------------- */

const matchSchema = new mongoose.Schema({
clothes: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "Clothes",
required: true,
},
],

userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},

colors: { type: [String], required: true },
min_temp: { type: Number, required: true },
max_temp: { type: Number, required: true },
type: { type: String, required: true },

spring: { type: Boolean, required: true },
summer: { type: Boolean, required: true },
autumn: { type: Boolean, required: true },
winter: { type: Boolean, required: true },

styles: { type: [String], default: [] },
tags: { type: [String], required: false },

rejected: { type: Boolean, required: true },
lastWornDate: { type: Date, required: true },

userMade: { type: Boolean, required: true },
});

/* -------------------- TODAY -------------------- */

const todaySchema = new mongoose.Schema({
clothes: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "Clothes",
required: true,
},
],

userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},

colors: { type: [String], required: true },
min_temp: { type: Number, required: true },
max_temp: { type: Number, required: true },
type: { type: String, required: true },

spring: { type: Boolean, required: true },
summer: { type: Boolean, required: true },
autumn: { type: Boolean, required: true },
winter: { type: Boolean, required: true },

styles: { type: [String], required: true },
tags: { type: [String], required: false },

rejected: { type: Boolean, required: true },

lastWornDate: { type: Date, default: null },

rank: { type: Number, default: null },

userMade: { type: Boolean, required: true },
});

/* -------------------- CLOTHES -------------------- */

const clothesSchema = new mongoose.Schema({
name: { type: String, required: true },
imageUrl: { type: String, default: "" },

userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},

min_temp: { type: Number, required: true },
max_temp: { type: Number, required: true },
colors: { type: [String], required: true },
styles: { type: [String], required: true },
type: { type: String, required: true },
subtype: { type: String, required: true },

lastWornDate: { type: Date, default: null },
tags: { type: [String], required: false },

spring: { type: Boolean, required: true },
summer: { type: Boolean, required: true },
autumn: { type: Boolean, required: true },
winter: { type: Boolean, required: true },
});

/* -------------------- MODELS -------------------- */

module.exports = {
User: mongoose.model("User", userSchema),
Match: mongoose.model("Match", matchSchema),
Today: mongoose.model("Today", todaySchema),
Clothes: mongoose.model("Clothes", clothesSchema),
};