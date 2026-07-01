/* USERS */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    
},
{strictQuery: false}
)

/* MATCHES */


const matchSchema = new mongoose.Schema({
  top: { type: String, default: null },
  bottom: { type: String, default: null },
  outer: { type: String, default: null },
  onepiece: { type: String, default: null },
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
  lastWornDate: { type: Date, required: true  },
  userMade: { type: Boolean, required: true },
  username: { type: String, required: true, default: "guest" },
});



const todaySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: false }, // Keep original Match ID
  top: { type: String, default: null },
  bottom: { type: String, default: null },
  outer: { type: String, default: null },
  onepiece: { type: String, default: null },
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
  username: { type: String, required: true, default: "guest" },
});

/* CLOTHING */ 


/*const bottomSchema = new mongoose.Schema({
  name: { type: String, required: true},
  imageUrl: { type: String, default: "" },
  min_temp: { type: Number, required: true },
  max_temp: { type: Number, required: true },
  colors: { type: [String], required: true },
  styles: { type: [String], required: true },
  type: { type: String, default: "bottom", enum: ["bottom"], required: true },
  spring: { type: Boolean, required: true },
  summer: { type: Boolean, required: true },
  autumn: { type: Boolean, required: true },
  winter: { type: Boolean, required: true },
  username: { type: String, required: true, default: "guest" },
});


const onePieceSchema = new mongoose.Schema({
  name: { type: String, required: true},
  imageUrl: { type: String, default: "" },
  min_temp: { type: Number, required: true },
  max_temp: { type: Number, required: true },
  colors: { type: [String], required: true },
  styles: { type: [String], required: true },
  type: { type: String, default: "onepiece", enum: ["onepiece"], required: true },
  spring: { type: Boolean, required: true },
  summer: { type: Boolean, required: true },
  autumn: { type: Boolean, required: true },
  winter: { type: Boolean, required: true },
  username: { type: String, required: true, default: "guest" },
});


const outerSchema = new mongoose.Schema({
  name: { type: String, required: true},
  imageUrl: { type: String, default: "" },
  min_temp: { type: Number, required: true },
  max_temp: { type: Number, required: true },
  colors: { type: [String], required: true },
  styles: { type: [String], required: true },
  type: { type: String, default: "outer", enum: ["outer"], required: true },
  spring: { type: Boolean, required: true },
  summer: { type: Boolean, required: true },
  autumn: { type: Boolean, required: true },
  winter: { type: Boolean, required: true },
  username: { type: String, required: true, default: "guest" },
});


const topSchema = new mongoose.Schema({
  name: { type: String, required: true},
  imageUrl: { type: String, default: "" },
  min_temp: { type: Number, required: true },
  max_temp: { type: Number, required: true },
  colors: { type: [String], required: true },
  styles: { type: [String], required: true },
  type: { type: String, default: "top", enum: ["top"], required: true },
  spring: { type: Boolean, required: true },
  summer: { type: Boolean, required: true },
  autumn: { type: Boolean, required: true },
  winter: { type: Boolean, required: true },
  username: { type: String, required: true, default: "guest" },
});*/

const clothesSchema = new mongoose.Schema({
  name: { type: String, required: true},
  imageUrl: { type: String, default: "" },
  min_temp: { type: Number, required: true },
  max_temp: { type: Number, required: true },
  colors: { type: [String], required: true },
  styles: { type: [String], required: true },
  type: { type: String, required: true },
  spring: { type: Boolean, required: true },
  summer: { type: Boolean, required: true },
  autumn: { type: Boolean, required: true },
  winter: { type: Boolean, required: true },
  username: { type: String, required: true, default: "guest" },
});


module.exports = {
  User: mongoose.model('User', userSchema),
  Match: mongoose.model('Match', matchSchema),
  Today: mongoose.model('Today', todaySchema),
  /*Top: mongoose.model('Top', topSchema),
  Bottom: mongoose.model('Bottom', bottomSchema),
  Outer: mongoose.model('Outer', outerSchema),
  OnePiece: mongoose.model('OnePiece', onePieceSchema),*/
  Clothes: mongoose.model('Clothes', clothesSchema)
};