const chalk = require('chalk');
const program = require('commander');
const config = require('config');
const inquirer = require('inquirer');
const util = require('util');

const spawn = util.promisify(require('child_process').spawn);

const upServersChoice = () => {
  selectServers()
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

const upServersDevelopmentChoice = () => {
  selectServers()
    .then((answers) => {
      return upDevelopmentServers(answers.servers);
    })
    .then((stdOuts) => {
      console.log(chalk.green('All servers have been started successfully!'));
    })
    .catch((error) => {
      console.log(chalk.red(error));
    });
};

const selectServers = () => {
  const prompts = [
    {
      type: 'checkbox',
      name: 'servers',
      message: 'What servers do you want to start?',
      choices: getServers
    }
  ];

  return inquirer.prompt(prompts);
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
  return executeScriptOnServers('start', serversToStart);
};

const upDevelopmentServers = (serversToStart) => {
  return executeScriptOnServers('start:dev', serversToStart);
};

const executeScriptOnServers = (script, servers) => {
  const availableServers = config.get('servers');
  const startServersPromises = servers.map((server) => {
    console.log(`Server ${chalk.cyan(availableServers[server].name)} is listening...`);
    return spawn('npm', ['run', script, '--prefix', availableServers[server].directory], { stdio: 'inherit' });
  });

  return Promise.all(startServersPromises);
};

program
  .version('1.0.0')
  .option('-u, --up', 'up servers')
  .option('-d, --dev', 'up servers on development mode')
  .parse(process.argv);

if (program.up) {
  upServersChoice();
}

if (program.dev) {
  upServersDevelopmentChoice();
}
