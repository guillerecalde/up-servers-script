const chalk = require('chalk');
const program = require('commander');
const config = require('config');
const inquirer = require('inquirer');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

const upServersChoice = () => {
  const prompts = [
    {
      type: 'checkbox',
      name: 'servers',
      message: 'What servers do you want to start?',
      choices: getServers
    }
  ];

  inquirer
    .prompt(prompts)
    .then((answers) => {
      return upServers(answers.servers);
    })
    .then((stdOuts) => {
      console.log(chalk.green('All servers have been started successfully!'));
    })
    .catch((error) => {
      console.log(chalk.red(error));
    });
};

const downServersChoice = () => {
  console.log(chalk.green('Stopping servers...'));
};

const getServers = () => {
  const servers = config.get('servers');
  return Object.keys(servers).map((serverKey) => {
    return {
      name: servers[serverKey].name,
      value: serverKey
    };
  });
};

const upServers = (serversToStart) => {
  const servers = config.get('servers');
  const startServersPromises = serversToStart.map((serverToStart) => {
    console.log(`Server ${chalk.cyan(servers[serverToStart].name)} is listening...`);
    return exec(`npm start --prefix ${servers[serverToStart].directory}`);
  });

  return Promise.all(startServersPromises);
};

program
  .version('1.0.0')
  .option('-u, --up', 'up servers')
  .option('-d, --down', 'down servers')
  .parse(process.argv);

if (program.up) {
  upServersChoice();
}

if (program.down) {
  downServersChoice();
}
