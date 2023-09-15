import { useContext } from "react";
import { ProticoAuthContext } from "../contexts/ProticoAuthContext";

export const useProticoAuth = () => {
  const {
    login,
    logout,
    logined,
    connectedAdapterName,
    provider,
    address,
    chainId,
    proticoAuthenticate,
    isProticoAuthenticated,
  } = useContext(ProticoAuthContext);
  return {
    login,
    logout,
    logined,
    connectedAdapterName,
    provider,
    address,
    chainId,
    proticoAuthenticate,
    isProticoAuthenticated,
  };
};
