export function getServe(chainId: number) {
  let serve = 'ropsten';
  switch (chainId) {
    case 1:
      serve = 'mainnet';
      break;
    case 3:
      serve = 'ropsten';
      break;
    case 4:
      serve = 'rinkeby';
      break;

    case 5:
      serve = 'goerli';
      break;
  }

  return `wss://${serve}.infura.io/ws/v3/9051214983f74c03b9f1d0c0bf32253e`;
}
