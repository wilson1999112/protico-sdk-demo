import { useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
import { AbstractProvider } from "web3-core";

async function test(provider: AbstractProvider | null) {
  if (!provider) return;
  console.log(provider);
  const web3 = new Web3(provider);
  console.log("before");
  const address = (await web3.eth.getAccounts())[0].toLowerCase();
  console.log("after");
  console.log(address);
}

function App() {
  useEffect(() => {
    const frame = document.getElementById("proticoFrame") as HTMLIFrameElement;
    const bObj = document.getElementById("frameBoxHandler") as HTMLDivElement;
    bObj.onclick = () => {
      if (frame.style.display === "block") {
        frame.style.display = "none";
        bObj.style.width = "auto";
        bObj.innerHTML = "Lobby&nbsp;💬";
        //// endline;
      } else {
        frame.src =
          "https://dev.protico.io/protico?roomUrl=" + window.location.href;
        frame.style.display = "block";
        bObj.style.width = "70px";
        bObj.innerHTML = "Exit&nbsp;👋";
        //// endline;
      }
    };
  }, []);
  return (
    <div className="App">
      <h1>Protico Iframe Test</h1>
      <span
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: "9999",
          background: "transparent",
        }}
      >
        <iframe
          id="proticoFrame"
          style={{
            display: "none",
            border: "1px solid #666",
            borderRadius: "8px",
            boxShadow: "2px 2px rgba(0,0,0,0.2)",
            width: "310px",
            height: "500px",
            marginBottom: "0.5em",
            minWidth: "325px",
            minHeight: "400px",
          }}
        ></iframe>
        <div
          id="frameBoxHandler"
          style={{
            display: "flex",
            boxShadow: "2px2px rgba(0,0,0,0.2)",
            bottom: "0px",
            marginLeft: "auto",
            marginTop: "10px",
            width: "auto",
            height: "40px",
            padding: "0 13px",
            borderRadius: "20px",
            background: "#282c34",
            color: "#1f8feb",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
          }}
        >
          Web3&nbsp;Lobby&nbsp;💬
        </div>
      </span>
    </div>
  );
}

export default App;
