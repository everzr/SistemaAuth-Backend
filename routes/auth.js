// routes/auth.js
import { Router } from "express";
import passport from "passport";
import { signUserJwt } from "../utils/jwt.js";

const router = Router();
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";
const isProd = process.env.NODE_ENV === "production";

function setAuthCookieAndRedirect(res, user) {
  const token = signUserJwt(user);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd, // en prod debe ser true (HTTPS)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.redirect(`${FRONTEND}/`);
}

// GOOGLE
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND}/login?error=google`,
  }),
  (req, res) => setAuthCookieAndRedirect(res, req.user)
);

// GITHUB
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${FRONTEND}/login?error=github`,
  }),
  (req, res) => setAuthCookieAndRedirect(res, req.user)
);

// Logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // en prod: true junto a sameSite:'none'
  });
  res.status(204).end();
});

export default router;
