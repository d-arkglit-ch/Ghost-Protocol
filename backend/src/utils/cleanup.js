import { User } from "../models/userModels.js";
import { Room } from "../models/roomModel.js";
import { Message } from "../models/messageModel.js";

/**
 * Production-grade background cleanup worker (runs every 5 minutes):
 * 1. Inactive Guests: Purged after 30 minutes of inactivity.
 * 2. Inactive Registered Users: Purged after 6 months (180 days) of inactivity.
 * 3. Idle Rooms: Burner/Omegle rooms with zero activity for >2 hours are deleted.
 * 4. Orphaned Messages: Any messages whose parent room was deleted are wiped from MongoDB.
 */
export const startCleanupJob = () => {
  const runCleanup = async () => {
    try {
      console.log("🧹 [CLEANUP] Running production garbage collection...");

      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      // ─── 1. Clean Inactive Users (Guests & Expired Registered) ───────
      const expiredUsers = await User.find({
        $or: [
          { isGuest: true, lastActive: { $lt: thirtyMinsAgo } },
          { isGuest: false, lastActive: { $lt: sixMonthsAgo } },
        ],
      })
        .select("_id username isGuest")
        .lean();

      if (expiredUsers.length > 0) {
        console.log(`🗑️ [CLEANUP] Found ${expiredUsers.length} inactive users to delete.`);
        for (const user of expiredUsers) {
          await Message.deleteMany({ user_id: user._id });
          await Room.deleteMany({ created_by: user._id });
          await Room.updateMany({ members: user._id }, { $pull: { members: user._id } });
          await User.findByIdAndDelete(user._id);
          console.log(`[CLEANUP] Deleted user: ${user.username} (Guest: ${user.isGuest})`);
        }
      }

      // ─── 2. Clean Idle Rooms (Zero activity for 2 hours) ────────────
      const idleRooms = await Room.find({
        last_active: { $lt: twoHoursAgo },
      })
        .select("_id code")
        .lean();

      if (idleRooms.length > 0) {
        console.log(`🗑️ [CLEANUP] Found ${idleRooms.length} idle rooms (>2h inactive) to delete.`);
        for (const room of idleRooms) {
          await Message.deleteMany({ room_id: room._id });
          await Room.findByIdAndDelete(room._id);
          console.log(`[CLEANUP] Deleted idle room: ${room.code}`);
        }
      }

      // ─── 3. Clean Orphaned Messages (Rooms that expired via TTL) ─────
      const activeRooms = await Room.find().select("_id").lean();
      const activeRoomIds = activeRooms.map((r) => r._id);

      const orphanPurge = await Message.deleteMany({
        room_id: { $nin: activeRoomIds },
      });

      if (orphanPurge.deletedCount > 0) {
        console.log(`🧹 [CLEANUP] Purged ${orphanPurge.deletedCount} orphaned messages.`);
      }
    } catch (err) {
      console.error("❌ [CLEANUP] Cleanup job failed:", err);
    }
  };

  // Run on startup after 10s, then repeat every 5 minutes
  setTimeout(runCleanup, 10000);
  setInterval(runCleanup, 5 * 60 * 1000);
};
