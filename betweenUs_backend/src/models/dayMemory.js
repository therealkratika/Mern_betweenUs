// models/dayMemory.js
const mongoose = require("mongoose");

const dayMemorySchema = new mongoose.Schema(
  {
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    caption: {
      type: String,
      default: ""
    },

    emotion: {
      type: String,
      enum: ["love", "joy", "peaceful", "together", "nostalgic"],
      default: "love"
    },

    photos: [
      {
        url: {
          type: String,
          required: true
        }
      }
    ],

    coverPhotoIndex: {
      type: Number,
      default: 0
    },

   reactions: [
  {
    emoji: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }
]

  },
  { timestamps: true }
);

module.exports = mongoose.model("DayMemory", dayMemorySchema);
