// Import your server main file
import app from "../server/index.js";

// Export a serverless function handler
export default (req, res) => {
  return app(req, res);
};
