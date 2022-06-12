import React, { Provider, useEffect, useState } from 'react';
import './App.css';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { getServe } from './config';

interface TransforType {
  id: number;
  address: string;
  token: number;
  message: string;
}
function App() {
  const [list, setLsit] = useState<TransforType[]>([{ id: new Date().getTime(), address: '', token: 0, message: '' }]);
  const { web3Intent, chainId } = useConnectWalletHooks();

  const addressChange = (e: React.ChangeEvent<HTMLInputElement>, id: number, type: string) => {
    const value = e.target.value;
    list.forEach((item) => {
      if (item.id === id) {
        item.message = '';
        if (type === 'address') {
          item.address = value;
        }
      }
    });
    setLsit([...list]);
  };

  const tokenChange = (e: React.ChangeEvent<HTMLInputElement>, id: number, type: string) => {
    let value: string | number = e.target.value;
    if (value) {
      value = parseFloat(value);
    } else {
      value = 0;
    }
    list.forEach((item) => {
      if (item.id === id) {
        item.message = '';
        if (type === 'token' && typeof value === 'number') {
          item.token = value;
        }
      }
    });
    setLsit([...list]);
  };

  const addTransforInfo = () => {
    const id = new Date().getTime();
    list.push({ id, address: '', token: 0, message: '' });
    setLsit([...list]);
  };

  const deleteTransfor = (id: number) => {
    const filetList = list.filter((item) => {
      return item.id !== id;
    });
    setLsit([...filetList]);
  };

  const checkForm = async () => {
    let allToken = 0;
    const account = web3Intent?.eth.defaultAccount;
    if (!web3Intent || !account) {
      return false;
    }
    // checkout form
    let errorStatus = false;
    list.forEach((item) => {
      const { token, address } = item;
      if (!address) {
        item.message = 'Address is not null!';
        errorStatus = true;
        return;
      } else {
        if (!web3Intent.utils.isAddress(address)) {
          item.message = 'Illegal address!';
          errorStatus = true;
          return;
        }
      }
      if (token === 0 || token < 0) {
        item.message = 'Token cannot be less than 0';
        errorStatus = true;
        return;
      } else {
        allToken = allToken + token;
      }
    });
    setLsit([...list]);
    if (errorStatus) {
      return false;
    }
    const balance = await web3Intent.eth.getBalance(account);
    if (allToken > parseFloat(web3Intent.utils.fromWei(balance, 'ether'))) {
      list.forEach((item) => {
        item.message = 'Insufficient account balance!';
      });
      setLsit([...list]);
      return false;
    }
    return true;
  };

  const submitHandle = async () => {
    const account = web3Intent?.eth.defaultAccount;
    if (web3Intent && account) {
      const res = await checkForm();
      if (!res) {
        return;
      }
      try {
        const transfors = list.map((item) => {
          const res = web3Intent.eth.sendTransaction({
            from: account,
            to: item.address,
            value: web3Intent.utils.toHex(web3Intent.utils.toWei(item.token + '', 'ether')),
            gasPrice: web3Intent.utils.toHex(web3Intent.utils.toWei('10', 'gwei')),
            chainId: parseInt(chainId, 10),
          });
          res.catch((e) => {
            item.message = e.message;
          });
        });
        Promise.all(transfors)
          .then((res) => {
            console.log(res);
            list.forEach((item) => {
              if (!item.message) {
                item.message = 'Successful trade';
              }
            });
          })
          .catch((e) => {
            console.log(e);
          });

        setLsit([...list]);
      } catch (e) {
        console.log('error', e);
      }
    } else {
      alert('连接钱包失败！');
    }
  };

  return (
    <div className="App">
      <h1>Transfer</h1>
      <p>Transfer your Token here</p>
      <form>
        {list.map((item) => (
          <div className="item_wrapper" key={item.id}>
            <label>
              <span className="label">Address</span>
              <input
                onChange={(e) => {
                  addressChange(e, item.id, 'address');
                }}
              />
            </label>
            <label>
              <span className="label">Token</span>
              <input
                type="number"
                onChange={(e) => {
                  tokenChange(e, item.id, 'token');
                }}
              />
            </label>
            <span
              onClick={() => {
                deleteTransfor(item.id);
              }}
              className="clear"
            >
              X
            </span>
            {item.message && <span>{item.message}</span>}
          </div>
        ))}
      </form>
      <button
        onClick={() => {
          addTransforInfo();
        }}
      >
        add
      </button>
      <button
        onClick={() => {
          submitHandle();
        }}
      >
        Transfer
      </button>
    </div>
  );
}

const useConnectWalletHooks = () => {
  const [web3Intent, setWeb3Intent] = useState<null | Web3>(null);
  const [chainId, setchainId] = useState('0');
  useEffect(() => {
    (async () => {
      let web3 = new Web3();
      // connect metamask
      const provider = (await detectEthereumProvider()) as any;
      if (provider) {
        web3.setProvider(provider);
        const res = await web3.eth.getAccounts();
        const account = res[0];
        if (account) {
          web3.eth.defaultAccount = account;
        }
        setchainId(provider.chainId);
        setWeb3Intent(web3);
        subscribe(parseInt(chainId, 10), account);
      } else {
        console.log('链接metamask失败');
      }

      // account change
      provider.on('accountsChanged', (accounts: string[]) => {
        const account = accounts[0];
        web3.eth.defaultAccount = account;
        setWeb3Intent(web3);
        subscribe(parseInt(chainId, 10), account);
      });

      // chindid change
      provider.on('chainChanged', (chainId: string) => {
        setchainId(chainId);
        window.location.reload();
      });
    })();
  }, []);

  return { web3Intent, chainId };
};

const subscribe = (chainId: number, account: string) => {
  const wsURL = getServe(chainId);
  const web3 = new Web3(wsURL);

  const check = (data: any) => {
    if (data.from === '0xA0859820C02315268D59c4f02f1cb0C335fD67A1') {
      console.log(data);
    }
    data = null;
  };

  const check2 = async (data: any) => {
    // 根据 tx 来获取数据
    await web3.eth
      .getTransaction(data)
      .then(async (data) => {
        await check(data);
      })
      .catch((reason) => {});
  };

  const subscription = web3.eth
    .subscribe('pendingTransactions', function (error, result) {
      if (!error) {
      } else {
        console.log('test', 'error', error);
      }
    })
    .on('connected', function (subscriptionId) {
      console.log('test', 'subscriptionId', subscriptionId);
    })
    .on('data', function (data) {
      check2(data);
    })
    .on('changed', function (log) {
      console.log('test', log);
    });
};

export default App;
