/**
 * .agent/skills/faculty-photo-processor/scripts/process_faculty_photo.js
 * 
 * 同心華德福教師照片處理腳本
 * 全自動化生成符合 "魔法報紙" 特效風格的 Pencil 素描版照片
 * 
 * 使用方式:
 * node process_faculty_photo.js --input <path_to_color_image> --output <path_to_pencil_image>
 */

const sharp = require('sharp');
const path = require('path');

// 獲取命令行參數
const args = process.argv.slice(2);
const inputArg = args.indexOf('--input');
const outputArg = args.indexOf('--output');

if (inputArg === -1 || outputArg === -1) {
    console.error('ERROR: Missing required arguments.');
    console.log('Usage: node process_faculty_photo.js --input <input_path> --output <output_path>');
    process.exit(1);
}

const inputPath = args[inputArg + 1];
const outputPath = args[outputArg + 1];

/**
 * 處理照片以符合專案美術風格（Pencil/Sketch）
 */
async function processPhoto(input, output) {
    try {
        console.log(`Processing: ${input} ...`);

        await sharp(input)
            .grayscale() // 1. 去色
            .modulate({
                brightness: 1.1, // 2. 略微提升基礎亮度 (1.1x)
                saturation: 0,
                hue: 0
            })
            .linear(1.3, 15) // 3. 微對比/偏移修正: 1.3對比，15偏移補償
            .gamma(2.2)    // 4. 重中之重：Gamma 2.2 推亮中間調，呈現「淺色透視感」
            .webp({ quality: 80 }) // 5. 強制 WebP 格式並優化
            .toFile(output);

        console.log(`SUCCESS: Saved to ${output}`);
    } catch (err) {
        console.error(`ERROR processing photo: ${err.message}`);
        process.exit(1);
    }
}

// 執行處理
processPhoto(inputPath, outputPath);
