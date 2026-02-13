const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
   firebaseUid: {
  type: String,
  unique: true,
  required: true
},


    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      default: null
    },

    isScheduledForDeletion: {
      type: Boolean,
      default: false
    },

    deleteAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
