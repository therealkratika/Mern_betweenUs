const cron = require("node-cron");
const User = require("../models/user");
const Space = require("../models/space");
const DayMemory = require("../models/dayMemory");
const Letter = require("../models/letters");

// Runs every day at 3 AM
cron.schedule("0 3 * * *", async () => {
  try {
    const expiredUsers = await User.find({
      isScheduledForDeletion: true,
      deleteAt: { $lte: new Date() }
    });

    const processedSpaces = new Set();

    for (const user of expiredUsers) {
      const spaceId = user.spaceId?.toString();

      // ✅ If user belongs to a space and it's not processed yet
      if (spaceId && !processedSpaces.has(spaceId)) {
        processedSpaces.add(spaceId);

        await DayMemory.deleteMany({ spaceId });
        await Letter.deleteMany({ spaceId });
        await Space.findByIdAndDelete(spaceId);

        // delete BOTH users in that space
        await User.deleteMany({ spaceId });

      } else if (!spaceId) {
        // user without space
        await User.findByIdAndDelete(user._id);
      }
    }

    console.log("🧹 Old accounts permanently deleted");
  } catch (err) {
    console.error("❌ CRON DELETE ERROR", err);
  }
});
