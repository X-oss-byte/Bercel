import chalk from 'chalk';

import {
  getPkgName,
  getArgs,
  getSubcommand,
  Client,
  handleError,
  logo,
} from '@vercel-internals/utils';
import init from './init';
import { isError } from '@vercel/error-utils';

const COMMAND_CONFIG = {
  init: ['init'],
};

const help = () => {
  console.log(`
  ${chalk.bold(`${logo} ${getPkgName()} init`)} [example] [dir] [-f | --force]

  ${chalk.dim('Options:')}

    -h, --help        Output usage information
    -d, --debug       Debug mode [off]
    --no-color        No color mode [off]
    -f, --force       Overwrite destination directory if exists [off]

  ${chalk.dim('Examples:')}

  ${chalk.gray('–')}  Choose from all available examples

      ${chalk.cyan(`$ ${getPkgName()} init`)}

  ${chalk.gray('–')}  Initialize example project into a new directory

      ${chalk.cyan(`$ ${getPkgName()} init <example>`)}

  ${chalk.gray('–')}  Initialize example project into specified directory

      ${chalk.cyan(`$ ${getPkgName()} init <example> <dir>`)}

  ${chalk.gray('–')}  Initialize example project without checking

      ${chalk.cyan(`$ ${getPkgName()} init <example> --force`)}
  `);
};

export default async function main(client: Client) {
  const { output } = client;
  let argv;
  let args;

  try {
    argv = getArgs(client.argv.slice(2), {
      '--force': Boolean,
      '-f': Boolean,
    });
    args = getSubcommand(argv._.slice(1), COMMAND_CONFIG).args;
  } catch (err) {
    handleError(err);
    return 1;
  }

  if (argv['--help']) {
    help();
    return 2;
  }

  if (argv._.length > 3) {
    output.error('Too much arguments.');
    return 1;
  }

  try {
    return await init(client, argv, args);
  } catch (err: unknown) {
    output.prettyError(err);
    if (isError(err) && typeof err.stack === 'string') {
      output.debug(err.stack);
    }
    return 1;
  }
}
