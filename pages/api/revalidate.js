export default async function handler(req, res) {
  let inboundRevalToken = req.headers["x-vercel-reval-key"];

  // Check for secret to confirm this is a valid request
  if (!inboundRevalToken) {
    return res.status(401).json({message: "x-vercel-reval-key header not defined"});
  } else if (inboundRevalToken !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({message: "Invalid token"});
  }

  try {
    const roomSlug = req.body;

    await res.revalidate(`/room/${roomSlug}`);

    return res.status(200).send("Success!");
  } catch (err) {
    return res.status(500).send("Error revalidating");
  }
}
