const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizedRoles = require("../middlewares/roleMiddleware");
const {
  updateUserProfile,
  getAllUsers,
} = require("../controllers/authController");

const router = express.Router();

// admin route
router.get("/admin", verifyToken, authorizedRoles("admin"), (req, res) => {
  res.json({ message: "Admin page" });
});

// landlord route
router.get(
  "/landlord",
  verifyToken,
  authorizedRoles("admin", "landlord"),
  (req, res) => {
    res.json({ message: "Landlord page" });
  }
);

// tenant route
router.get("/tenant", (req, res) => {
  res.json({ message: "Tenant page" });
});

// agent route
router.get(
  "/agent",
  verifyToken,
  authorizedRoles("admin", "landlord"),
  (req, res) => {
    res.json({ message: "Agent page" });
  }
);

// Update User Profile
router.put("/profile", verifyToken, updateUserProfile);
router.get("/users", getAllUsers);

module.exports = router;
