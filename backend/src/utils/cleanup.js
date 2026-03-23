import { User } from "../models/userModels.js";
import { Room } from "../models/roomModel.js";
import { Message } from "../models/messageModel.js";

/**
 * Runs a background job to clean up inactive users to keep the DB small.
 * - Guests without activity for 5 minutes are deleted.
 * - Registered users without activity for 7 days are deleted.
 * 
 * Also cascade-deletes their rooms and messages.
 */
export const startCleanupJob = () => {
  // Run every 5 minutes
  setInterval(async () => {
    try {
      console.log("🧹 Running inactive user cleanup job...");
      
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Find expired users
      const expiredUsers = await User.find({
        $or: [
          { isGuest: true, lastActive: { $lt: fiveMinsAgo } },
          { isGuest: false, lastActive: { $lt: sevenDaysAgo } }
        ]
      });

      if (expiredUsers.length === 0) return;

      console.log(`🗑️ Found ${expiredUsers.length} inactive users to delete.`);

      for (const user of expiredUsers) {
        // Cascade delete
        await Message.deleteMany({ user_id: user._id });
        await Room.deleteMany({ created_by: user._id });
        await Room.updateMany({ members: user._id }, { $pull: { members: user._id } });
        await User.findByIdAndDelete(user._id);
        
        console.log(`Deleted user: ${user.username} (Guest: ${user.isGuest})`);
      }
      
    } catch (err) {
      console.error("❌ Cleanup job failed:", err);
    }
  }, 5 * 60 * 1000);
};
