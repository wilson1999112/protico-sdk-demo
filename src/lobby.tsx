import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { LobbyWebsocketProvider } from "./contexts/LobbyWebsocketContext";
import { getLobby } from "./utils/lobbies";
import urlParse from "url-parse";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { LobbyItem } from "protico-sdk";

interface LobbyData {
  lobby: LobbyItem;
}
export async function loader({ params }: LoaderFunctionArgs) {
  const lobby = await getLobby(params.lobbyId);
  return { lobby };
}
export default function Lobby() {
  const { lobby } = useLoaderData() as LobbyData;

  return (
    <LobbyWebsocketProvider
      room={lobby.id}
      roomDomain={urlParse(lobby.url).host}
      roomUrl={lobby.url}
      key={lobby.id}
    >
      <div className="bg-[#1b1d21] flex flex-col h-full">
        <div className=" basis-12 border-b-[1px] border-[#312f34] flex">
          <p className="pl-5 my-auto">{lobby.url}</p>
        </div>
        <div className="flex-1 flex flex-col overflow-auto">
          <MessageList room={lobby.id} />
        </div>
        <div className="basis-24">
          <MessageInput />
        </div>
      </div>
    </LobbyWebsocketProvider>
  );
}
