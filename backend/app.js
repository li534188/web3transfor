const express = require("express");
const Web3 = require("web3");
const app = express();

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  subscribe();
  res.send("Hello world!");
});

function subscribe() {
    console.log('我已经开始订阅');
    const wsURL = 'wss://ropsten.infura.io/ws/v3/9051214983f74c03b9f1d0c0bf32253e';
    const web3 = new Web3(wsURL);
    var topics = web3.eth.abi.encodeEventSignature({
      name: 'Transfer',
      type: 'event',
      inputs: [
        {
          type: 'address',
          name: 'from',
        },
        {
          type: 'address',
          name: 'to',
        },
        {
          type: 'uint256',
          name: 'value',
        },
      ],
    });
    console.log('test', topics)
    const subscription = web3.eth
      .subscribe(
        'logs',
        {
          address: '0xA0859820C02315268D59c4f02f1cb0C335fD67A1',
          topics: [topics],
        },
        function (error, result) {
          if (!error) {
            console.log('test', 'result', result);
          } else {
            console.log('test', 'error', error);
          }
        },
      )
      .on('connected', function (subscriptionId) {
        console.log('test', 'subscriptionId', subscriptionId);
      })
      .on('data', function (log) {
        console.log('test', 'data', log);
      })
      .on('changed', function (log) {
        console.log('test', log);
      });
}

app.listen(8080);
