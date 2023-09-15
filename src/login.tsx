import { SUPPORTED_ADAPTERS } from "protico-sdk";
import { Navigate } from "react-router-dom";
import { useProticoAuth } from "./hooks/useProticoAuth";
import ProticoLogo from "./assets/logo192.png";
import "./login.css";
import LoginButton from "./components/LoginButton";
export default function Login() {
  const {
    login,
    logout,
    chainId,
    provider,
    address,
    proticoAuthenticate,
    connectedAdapterName,
  } = useProticoAuth();
  const onClickLoginMetamask = () => {
    login(SUPPORTED_ADAPTERS.METAMASK);
  };
  const onClickAsGuest = () => {
    login(SUPPORTED_ADAPTERS.GUEST);
  };

  const onClickLoginWalletconnect = () => {
    login(SUPPORTED_ADAPTERS.WALLET_CONNECT_V2);
  };

  if (connectedAdapterName) return <Navigate replace to="/" />;
  return (
    <div className="flex flex-row w-screen h-screen">
      <div className="flex-1 flex flex-col h-full justify-center items-center">
        <div className="flex flex-col font-sans">
          <LoginButton
            buttonText="Connect Metamask"
            onClick={onClickLoginMetamask}
            bgColor="metamaskorange"
            imgSrc="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
          />
          <LoginButton
            buttonText="Walletconnect"
            onClick={onClickLoginWalletconnect}
            bgColor="walletconnectblack"
            imgSrc="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/c6e9d7ca2e81d4094e83849f560a024962a7987a/Logo/White/Logo.svg"
          />
        </div>
        <div className="w-full my-5 flex flex-row">
          <div className="flex-1 flex items-center">
            <hr className="border-slate-400 w-full mx-16" />
          </div>
          <p className=" text-slate-200">or</p>
          <div className="flex-1 flex items-center">
            <hr className="border-slate-400 w-full mx-16" />
          </div>
        </div>
        <LoginButton
          buttonText="Login as Guest"
          onClick={onClickAsGuest}
          bgColor="guestblue"
        />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <img src={ProticoLogo} className="logo react" alt="React logo" />
      </div>
    </div>
  );
}
