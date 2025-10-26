const http = require("http");
const fs = require("fs");

const url = "http://localhost:3000/api/users";
const outputFile = "output.json";

http
  .get(url, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      try {
        // Pretty format if it's JSON, otherwise just write the string
        const parsed = JSON.parse(data);
        fs.writeFileSync(outputFile, JSON.stringify(parsed, null, 2));
        console.log("Data saved to output.json");
      } catch (e) {
        // If not valid JSON (rare for proper API), just dump as is
        fs.writeFileSync(outputFile, data);
        console.log("Raw response saved to output.json");
      }
    });
  })
  .on("error", (err) => {
    console.error("Failed to fetch API:", err.message);
  });
