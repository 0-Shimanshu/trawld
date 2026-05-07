const { spawn } = require('child_process');
const path = require('path');

const commands = [
  { name: 'CLOUD', cwd: 'cloud', cmd: 'npm', args: ['start'] },
  { name: 'AGENT', cwd: 'agent', cmd: 'npm', args: ['start'] }
];

commands.forEach(({ name, cwd, cmd, args }) => {
  const child = spawn(cmd, args, {
    cwd: path.join(__dirname, cwd),
    shell: true,
    stdio: 'pipe'
  });

  console.log(`[${name}] Starting...`);

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  child.on('close', (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });
});
