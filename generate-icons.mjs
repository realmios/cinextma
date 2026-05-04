// generate-icons.mjs
// Chạy: node generate-icons.mjs
// Yêu cầu: npm install sharp

import sharp from "sharp";
import fs from "fs";
import path from "path";

const SVG_FILE = "./logo.svg";
const svgBuffer = fs.readFileSync(SVG_FILE);

const sizes = {
  ios: [16,20,29,32,40,50,57,58,60,64,72,76,80,87,100,114,120,128,144,152,167,180,192,256,512,1024],
  android: [48,72,96,144,192,512],
  windows: [16,20,24,30,32,36,40,44,48,50,55,60,63,64,66,71,72,75,80,88,89,96,100,107,142,150,176,188,200,225,256,284,300,388,465,600,620,775,930,1240],
};

async function generate() {
  for (const [platform, sizeList] of Object.entries(sizes)) {
    const dir = `public/icons/${platform}`;
    fs.mkdirSync(dir, { recursive: true });

    for (const size of sizeList) {
      const outFile = path.join(dir, `${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outFile);
      console.log(`✓ ${outFile}`);
    }
  }

  // favicon.ico (32x32)
  await sharp(svgBuffer).resize(32, 32).png().toFile("public/favicon-32.png");
  console.log("✓ public/favicon-32.png (đổi tên thành favicon.ico hoặc dùng trực tiếp)");

  // 1024x1024 gốc
  await sharp(svgBuffer).resize(1024, 1024).png().toFile("public/icons/ios/1024.png");
  console.log("✓ public/icons/ios/1024.png");

  console.log("\n🎉 Xong! Tất cả icon đã được tạo.");
  console.log("Nhớ copy logo.svg vào public/ và đổi tên favicon-32.png thành favicon.ico");
}

generate().catch(console.error);
