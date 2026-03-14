const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    return next();

  } catch (err) {

    console.log("Erro JWT:", err.message);

    return res.status(401).json({ error: "Token inválido" });

  }

};
