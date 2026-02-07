const cron = require("node-cron");
const mongoose = require("mongoose");

const User = require("../models/user");
const Space = require("../models/space");
const DayMemory = require("../models/dayMemory");
const Letter = require("../models/letters");
const CronLockSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  lockedAt: { type: Date, default: Date.now }
});

const CronLock =
  mongoose.models.CronLock || mongoose.model("CronLock", CronLockSchema);
cron.schedule(
  "0 3 * * *",
  async () => {
    console.log("⏰ Delete-expired-accounts cron started");
    try {
      await CronLock.create({ name: "delete-expired-accounts" });
    } catch (e) {
      console.log("⚠️ Cron already running, skipping...");
      return;
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const expiredUsers = await User.find({
        isScheduledForDeletion: true,
        deleteAt: { $lte: new Date() }
      }).session(session);

      if (!expiredUsers.length) {
        console.log("✅ No expired users found");
        await session.commitTransaction();
        return;
      }

      const processedSpaces = new Set();

      for (const user of expiredUsers) {
        const spaceId = user.spaceId?.toString();
        if (spaceId && !processedSpaces.has(spaceId)) {
          processedSpaces.add(spaceId);

          console.log(`🗑 Deleting space ${spaceId}`);

          await DayMemory.deleteMany({ spaceId }).session(session);
          await Letter.deleteMany({ spaceId }).session(session);
          await Space.findByIdAndDelete(spaceId).session(session);
          await User.deleteMany({ spaceId }).session(session);
        }

        // ───────────────────────────────
        // 👤 USER WITHOUT SPACE
        // ───────────────────────────────
        if (!spaceId) {
          console.log(`🗑 Deleting solo user ${user._id}`);
          await User.findByIdAndDelete(user._id).session(session);
        }
      }

      await session.commitTransaction();
      console.log("🧹 Old accounts permanently deleted");

    } catch (err) {
      await session.abortTransaction();
      console.error("❌ CRON DELETE ERROR", err);
    } finally {
      session.endSession();
      await CronLock.deleteOne({ name: "delete-expired-accounts" });
    }
  }
);
