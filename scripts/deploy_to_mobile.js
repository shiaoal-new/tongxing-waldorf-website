const { exec, spawn } = require('child_process');

/**
 * Script to deploy to Firebase Hosting Channel, copy URL, notify, and sleep Mac.
 */
async function run() {
    console.log('🚀 Starting build and deploy to mobile test channel...');

    // 1. Execute the build and deploy command
    // We use spawn to see the output in real-time
    const deploy = spawn('npm', ['run', 'deploy:preview'], { shell: true });

    let output = '';
    deploy.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(str);
    });

    deploy.stderr.on('data', (data) => {
        process.stderr.write(data.toString());
    });

    deploy.on('close', (code) => {
        if (code === 0) {
            // Success!
            console.log('\n✅ Deploy successful!');

            // Extract URL - more flexible regex to handle "Channel URL (project-id): https://..."
            const urlMatch = output.match(/Channel URL.*?: (https:\/\/[^\s\[]+)/i);
            if (urlMatch && urlMatch[1]) {
                const url = urlMatch[1];
                console.log(`\n📋 Final URL: ${url}`);

                // Copy to clipboard (macOS specific)
                exec(`echo "${url}" | pbcopy`, (err) => {
                    if (err) console.error('Failed to copy to clipboard:', err);
                    else console.log('✨ URL copied to clipboard (Shared Clipboard ready for iPhone)');
                });

                // Notify using 'say'
                exec('say "test channel deploy 完成"');

                // Wait 10 seconds then sleep
                console.log('💤 Sleeping in 10 seconds... (Press Ctrl+C to cancel)');
                setTimeout(() => {
                    console.log('🌙 Goodnight!');
                    exec("osascript -e 'tell application \"System Events\" to sleep'");
                }, 10000);
            } else {
                console.error('❌ Could not find Channel URL in output.');
                exec('say "deploy 成功，但找不著網址"');
            }
        } else {
            // Failure
            console.error(`\n❌ Deploy failed with exit code ${code}`);
            exec('say "deploy 失敗，請檢查錯誤"');
        }
    });
}

run();
