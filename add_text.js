const sharp = require('sharp');

async function run() {
  const bgPath = 'C:\\Users\\ldkff\\.gemini\\antigravity\\brain\\fe8b985b-f3c7-4ddf-bb4a-52f35d788537\\og_boardgame_anime_1779790291123.png';
  const outPath = 'public\\og-image.png';

  const svgText = `
    <svg width="1200" height="630">
      <style>
        .title { fill: white; font-size: 100px; font-weight: 800; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; text-anchor: middle; }
        .shadow { fill: rgba(0,0,0,0.8); font-size: 100px; font-weight: 800; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; text-anchor: middle; }
      </style>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.4)" />
      <text x="604" y="344" class="shadow">보동 게임트래커</text>
      <text x="600" y="340" class="title">보동 게임트래커</text>
    </svg>
  `;

  try {
    await sharp(bgPath)
      .resize(1200, 630, { fit: 'cover' })
      .composite([{
        input: Buffer.from(svgText),
        top: 0,
        left: 0,
      }])
      .toFile(outPath);
    console.log('Successfully created og-image.png');
  } catch (err) {
    console.error('Error creating image:', err);
  }
}

run();
