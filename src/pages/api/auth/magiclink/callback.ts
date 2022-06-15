import passport from "passport";
import { NextApiResponse } from "next";
import handler from "../../../../server/api-route";

export default handler()
  .use(passport.authenticate("magiclogin"))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .use((req: any, res: NextApiResponse) => {
    res.redirect(req.user?.redirect || "/app");
  });
