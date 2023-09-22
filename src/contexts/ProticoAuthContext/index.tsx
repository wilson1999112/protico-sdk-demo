import {
  CONNECTED_EVENT_DATA,
  ProticoAuthCore,
  PROTICO_AUTH_EVENTS,
  SUPPORTED_ADAPTERS,
  SUPPORTED_ADAPTER_TYPE,
} from "protico-sdk";
import { AbstractProvider } from "web3-core";
import React, { useCallback } from "react";
import { getProticoClient } from "../../utils/api";

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
  const [isProticoAuthenticated, setIsProticoAuthenticated] =
    React.useState<boolean>(false);
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
        web3AccessTokenServer: "http://localhost:8000",
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
      const userToken = await getProticoClient().getWeb3AccessToken(
        proticoAuth.current
      );
      getProticoClient().setAuthToken(userToken.web3AccessToken);
      setIsProticoAuthenticated(true);
    } catch (err) {
      console.log(err);
    }
  };

  const proticoAuthenticateAutoStorage = React.useCallback(async () => {
    if (!provider || !address || !proticoAuth.current) {
      setIsProticoAuthenticated(false);
      getProticoClient().clearAuthToken();
      return;
    }
    const userTokenInStorage =
      await getProticoClient().web3AccessTokenAutoStorage(proticoAuth.current);
    if (!userTokenInStorage) {
      setIsProticoAuthenticated(false);
      getProticoClient().clearAuthToken();
      return;
    }
    getProticoClient().setAuthToken(userTokenInStorage.web3AccessToken);
    setIsProticoAuthenticated(true);
  }, [provider, address, proticoAuth.current]);

  React.useEffect(() => {
    proticoAuthenticateAutoStorage();
  }, [proticoAuthenticateAutoStorage]);
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
        isProticoAuthenticated,
      }}
    >
      {children}
    </ProticoAuthContext.Provider>
  );
};
