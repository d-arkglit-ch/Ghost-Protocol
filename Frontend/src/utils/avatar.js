// Helper to generate consistent colors and initials from usernames (Calm Organic Editorial)
export const getAvatarColor = (username = "User") => {
  const colors = [
    { bg: "bg-[#E4EDE6]", text: "text-[#1C4A2E]", border: "border-[#D5E0D7]" }, // Soft Sage / Deep Pine
    { bg: "bg-[#D8E6DB]", text: "text-[#163B25]", border: "border-[#C7D9CC]" }, // Mineral Mint / Dark Forest
    { bg: "bg-[#EDF4EE]", text: "text-[#1C4A2E]", border: "border-[#D8E4DA]" }, // Pale Sage / Pine
    { bg: "bg-[#D2E4D6]", text: "text-[#184228]", border: "border-[#BFD5C4]" }, // Calm Herb / Deep Pine
    { bg: "bg-[#DFEAE2]", text: "text-[#1C4A2E]", border: "border-[#CFDDD2]" }, // Clean Meadow / Forest
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const getInitials = (username = "User") => {
  if (!username) return "U";
  return username
    .split(/[\s_-]+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
