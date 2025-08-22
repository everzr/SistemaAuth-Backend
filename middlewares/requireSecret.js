// backend/middlewares/requireSecret.js
import { normalize } from "../utils/normalize.js";

export default function requireSecret(req, res, next) {
  const provided = (req.body?.pin ?? req.body?.key ?? "").toString();
  const envSecret = (
    process.env.SECRET_PIN ??
    process.env.SECRET_KEY ??
    ""
  ).toString();
  if (normalize(provided) !== normalize(envSecret)) {
    return res
      .status(401)
      .json({ success: false, message: "Clave incorrecta" });
  }
  next();
}
