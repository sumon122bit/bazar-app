const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const sourceImage = './assets/icon.png';
const androidResPath = './android/app/src/main/res';

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

async function generate() {
  try {
    console.log("🖼️ ছবি লোড হচ্ছে...");
    const image = await Jimp.read(sourceImage);

    for (const [folder, size] of Object.entries(sizes)) {
      const dir = path.join(androidResPath, folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // পুরোনো আইকন থাকলে ডিলিট করা
      ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'].forEach(file => {
         const filePath = path.join(dir, file);
         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      // নতুন আইকন তৈরি
      const iconPath = path.join(dir, 'ic_launcher.png');
      await image.clone().resize(size, size).writeAsync(iconPath);

      const roundIconPath = path.join(dir, 'ic_launcher_round.png');
      await image.clone().resize(size, size).writeAsync(roundIconPath);

      console.log(`✅ ${folder} এ আইকন তৈরি হয়েছে (${size}x${size})`);
    }
    console.log('🎉 সব আইকন সফলভাবে জেনারেট হয়েছে!');
  } catch (err) {
    console.error('❌ এরর:', err);
  }
}

generate();
