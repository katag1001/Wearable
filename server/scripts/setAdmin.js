// server/scripts/setAdmin.js
//
// Makes a user an admin (or not). Admins can edit the current trends on
// the web /trends page. This is the only way to change it - no API does.
// It takes effect straight away: the server checks the database on every
// admin request.
//
//   node server/scripts/setAdmin.js                                   lists the admins
//   node server/scripts/setAdmin.js someone@example.com               shows what would change
//   node server/scripts/setAdmin.js someone@example.com --confirm     makes them an admin
//   node server/scripts/setAdmin.js someone@example.com --remove --confirm
//
// Reads MONGO from server/.env, like the server does.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const { User } = require("../models/AllModels.js");

async function run() {
  const args = process.argv.slice(2);
  const email = args.find((arg) => !arg.startsWith("--"))?.trim().toLowerCase();
  const remove = args.includes("--remove");
  const confirm = args.includes("--confirm");

  await mongoose.connect(process.env.MONGO);

  try {
    if (!email) {
      const admins = await User.find({ isAdmin: true }).select("email").lean();
      console.log(admins.length ? `Admins: ${admins.map((user) => user.email).join(", ")}` : "No admins.");
      return;
    }

    const user = await User.findOne({ email }).select("email isAdmin").lean();

    if (!user) {
      console.log(`No user with the email ${email}.`);
      process.exitCode = 1;
      return;
    }

    const wanted = !remove;

    if (Boolean(user.isAdmin) === wanted) {
      console.log(`${email} is ${wanted ? "already" : "not"} an admin. Nothing to change.`);
      return;
    }

    if (!confirm) {
      console.log(`${email} would ${wanted ? "become an admin" : "stop being an admin"}. Run again with --confirm.`);
      return;
    }

    await User.updateOne({ _id: user._id }, { $set: { isAdmin: wanted } });
    console.log(`${email} is ${wanted ? "now an admin" : "no longer an admin"}.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
