import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

const MOCK_USERS = [
  {
    id: "1",
    name: "Admin",
    email: "admin@test.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
  },
  {
    id: "2",
    name: "User",
    email: "user@test.com",
    passwordHash: bcrypt.hashSync("user123", 10),
  },
];

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = MOCK_USERS.find((u) => u.email === email);
        if (!user) {
          return done(null, false, { message: "E-mail não encontrado." });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return done(null, false, { message: "Senha incorreta." });
        }

        return done(null, { id: user.id, name: user.name, email: user.email });
      } catch (err) {
        return done(err);
      }
    },
  ),
);

export { passport };
