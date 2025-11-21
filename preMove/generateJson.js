const fs = require("fs");
const path = require("path");

// 👇 Change this to your images folder
const folderPath = "C:/Users/elePLACAE/Desktop/Nativeapp/preMove/src/assets/images/Inventory_items";

const files = fs.readdirSync(folderPath);

// Create JSON
const data = {
  categories: files.map((file, index) => {
    const name = path.basename(file, path.extname(file)); // filename without extension
    return {
      id: index + 1,
      name: name.replace(/_/g, " "), // replace underscores with spaces
      image: `require("../assets/images/Inventory_items/${file}")`,
    };
  }),
};

// Save JSON
fs.writeFileSync("categories.json", JSON.stringify(data, null, 2));
console.log("✅ categories.json generated!");
