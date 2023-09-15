import { ProticoCeramic } from "protico-sdk";

const ceramicEndpoint = "https://ceramic.protico.io";
let proticoCeramicClient: ProticoCeramic;

export const getProticoCeramicClient = () => {
  if (!proticoCeramicClient) {
    proticoCeramicClient = new ProticoCeramic(ceramicEndpoint);
  }
  return proticoCeramicClient;
};
