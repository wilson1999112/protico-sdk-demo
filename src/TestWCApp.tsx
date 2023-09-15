import {
  WagmiConfig,
  createConfig,
  configureChains,
  mainnet,
  useDisconnect,
  useAccount,
} from "wagmi";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

// Set up wagmi config
const config = createConfig({
  autoConnect: false,
  connectors: [
    new WalletConnectConnector({
      //   chains:{},
      options: {
        projectId: "4b2c0fa0796ebdf722ab16ac098bc11f",
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

// Pass config to React Context Provider
function App() {
  return (
    <WagmiConfig config={config}>
      <Profile />
    </WagmiConfig>
  );
}

import { useConnect } from "wagmi";

export function Profile() {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  if (address) {
    return (
      <div>
        <button onClick={() => disconnect()}>disconnect</button>
        <SignMessage />
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && " (unsupported)"}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            " (connecting)"}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  );
}

import * as React from "react";
import { useSignMessage } from "wagmi";
import { recoverMessageAddress } from "viem";

export function SignMessage() {
  const recoveredAddress = React.useRef<string>();
  const { data, error, isLoading, signMessage, variables } = useSignMessage();

  React.useEffect(() => {
    (async () => {
      if (variables?.message && data) {
        const recoveredAddressRes = await recoverMessageAddress({
          message: variables?.message,
          signature: data,
        });
        recoveredAddress.current = recoveredAddressRes;
      }
    })();
  }, [data, variables?.message]);

  return (
    <form
      onSubmit={(event: any) => {
        event.preventDefault();
        signMessage({ message: "123" });
      }}
    >
      <label htmlFor="message">Enter a message to sign</label>
      <textarea
        id="message"
        name="message"
        placeholder="The quick brown fox…"
      />
      <button disabled={isLoading}>
        {isLoading ? "Check Wallet" : "Sign Message"}
      </button>

      {data && (
        <div>
          <div>Recovered Address: {recoveredAddress.current}</div>
          <div>Signature: {data}</div>
        </div>
      )}

      {error && <div>{error.message}</div>}
    </form>
  );
}

export default App;
