const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
    default: null
  },
  resetPasswordToken: { type: String },
resetPasswordExpires: { type: Date },
 isScheduledForDeletion: {
    type: Boolean,
    default: false
  },
  deleteAt: {
    type: Date,
    default: null
  }
});

// ✅ NO next PARAMETER
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
