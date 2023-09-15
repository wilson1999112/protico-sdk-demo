import {
  CONNECTED_EVENT_DATA,
  ProticoAuthCore,
  PROTICO_AUTH_EVENTS,
  SUPPORTED_ADAPTERS,
  SUPPORTED_ADAPTER_TYPE,
  UserIdToken,
} from "protico-sdk";
import { AbstractProvider } from "web3-core";
import React, { useCallback } from "react";
import { getProticoAPI } from "../../utils/api";

interface IProticoAuthContext {
  login: (adapter: SUPPORTED_ADAPTER_TYPE) => Promise<void>;
  logout: () => Promise<void>;
  logined: boolean;
  address: string | null;
  provider: AbstractProvider | null;
  chainId: string | null;
  connectedAdapterName: SUPPORTED_ADAPTER_TYPE | null;
  isProticoAuthenticated: boolean;
  proticoAuthenticate: () => Promise<void>;
}

export const ProticoAuthContext = React.createContext<IProticoAuthContext>({
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  logined: false,
  address: null,
  provider: null,
  chainId: null,
  connectedAdapterName: null,
  isProticoAuthenticated: false,
  proticoAuthenticate: () => Promise.resolve(),
});

export const ProticoAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  var proticoAuth = React.useRef<ProticoAuthCore>();
  const [provider, setProvider] = React.useState<AbstractProvider | null>(null);
  const [chainId, setChainId] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [idToken, setIdToken] = React.useState<UserIdToken | null>(null);
  const [connectedAdapterName, setConnectedAdapterName] =
    React.useState<SUPPORTED_ADAPTER_TYPE | null>(null);

  // Handle chain change event
  const handleChainChanged = ({ chainId }: { chainId: string }) => {
    setChainId(chainId);
  };
  const handleAccountChanged = ({ accounts }: { accounts: string[] }) => {
    setAddress(accounts[0]);
  };
  const handleConnected = async (data: CONNECTED_EVENT_DATA) => {
    setAddress(data.status?.address ?? null);
    if (data.status?.chainId) setChainId(data.status.chainId);
    setProvider(proticoAuth.current!.provider);
    setConnectedAdapterName(proticoAuth.current!.connectedAdapterName);
  };

  React.useEffect(() => {
    const init = () => {
      proticoAuth.current = new ProticoAuthCore({
        chainId: "0x1",
        enableLogging: true,
        web3IdTokenServer: "http://localhost:8000",
        adapterConfigs: {
          [SUPPORTED_ADAPTERS.METAMASK]: { enable: true },
          [SUPPORTED_ADAPTERS.WALLET_CONNECT_V2]: {
            enable: true,
            projectId: "4b2c0fa0796ebdf722ab16ac098bc11f",
          },
        },
      });
      proticoAuth.current!.on(
        PROTICO_AUTH_EVENTS.CHAIN_CHANGED,
        handleChainChanged
      );
      proticoAuth.current!.on(PROTICO_AUTH_EVENTS.CONNECTED, handleConnected);
      proticoAuth.current!.on(
        PROTICO_AUTH_EVENTS.ACCOUNT_CHANGED,
        handleAccountChanged
      );
      proticoAuth.current.init();
    };
    if (!proticoAuth.current) init();
  }, []);
  const login = async (adapter: SUPPORTED_ADAPTER_TYPE) => {
    if (!proticoAuth.current) return;
    try {
      await proticoAuth.current.connectTo(adapter);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = async () => {
    setProvider(null);
    if (!proticoAuth.current) return;
    await proticoAuth.current.disconnect();
    setConnectedAdapterName(null);
    setAddress(null);
  };
  const proticoAuthenticate = async () => {
    if (!proticoAuth.current) return;
    try {
      const userToken = await proticoAuth.current.getWeb3AuthToken();
      setIdToken(userToken);
    } catch (err) {
      console.log(err);
    }
  };

  const proticoAuthenticateAutoStorage = React.useCallback(async () => {
    if (!provider || !address || !proticoAuth.current) {
      setIdToken(null);
      return;
    }
    const userTokenInStorage =
      await proticoAuth.current.web3IdTokenAutoStorage();
    setIdToken(userTokenInStorage);
  }, [provider, address, proticoAuth.current]);

  React.useEffect(() => {
    proticoAuthenticateAutoStorage();
  }, [proticoAuthenticateAutoStorage]);

  React.useEffect(() => {
    if (!idToken?.idToken) {
      getProticoAPI().clearAuthToken();
      return;
    }
    getProticoAPI().setAuthToken(idToken.idToken);
  }, [idToken?.idToken]);

  return (
    <ProticoAuthContext.Provider
    value={{
      login,
      logout,
      logined: !!connectedAdapterName,
      address,
      chainId,
      provider,
      connectedAdapterName,
      proticoAuthenticate,
      isProticoAuthenticated:
        !!idToken && address === idToken.address.toLowerCase(),
    }}
    >
      {children}
    </ProticoAuthContext.Provider>
  );
};
