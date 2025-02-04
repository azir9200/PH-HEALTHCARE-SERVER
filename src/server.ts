import app from "./app";

const port = 3000;

// Start the server
async function main() {
  app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
  });
}

main();
