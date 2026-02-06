const mongoose = require("mongoose");

const spaceSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    inviteToken: {
      type: String,
      default: null
    },

    inviteEmail: {
      type: String,
      default: null
    },

    inviteExpiresAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["open", "locked"],
      default: "open"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Space", spaceSchema);
