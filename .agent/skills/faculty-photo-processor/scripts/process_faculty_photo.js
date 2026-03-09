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
 * 格式化照片為 WebP 規格
 * 僅進行格式轉換與品質優化，不套用額外濾鏡
 */
async function formatFacultyPhoto(input, output) {
    try {
        console.log(`Formatting: ${input} ...`);

        await sharp(input)
            .webp({ quality: 85, effort: 6 }) // 強制 WebP 格式並優化大小
            .toFile(output);

        console.log(`SUCCESS: Saved formatted image to ${output}`);
    } catch (err) {
        console.error(`ERROR formatting photo: ${err.message}`);
        process.exit(1);
    }
}

// 執行格式化
formatFacultyPhoto(inputPath, outputPath);
