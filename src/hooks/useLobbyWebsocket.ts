import { useContext } from "react";
import { LobbyWebsocketContext } from "../contexts/LobbyWebsocketContext";

export const useLobbyWebsocket = () => {
  const {
    handleSendMessage,
    readyState,
    nextReference,
    handleSetNextReference,
    shouldScrollToBottom,
    displayLatestMessage,
    cleanShouldScrollToBottom,
    handleSetShouldScrollToBottom,
    handleNewList,
    handleNewMessages,
    handleSetMessageList,
    isLatestMessageExist,
    displayMessageList,
    next,
    previous,
    handleSetNext,
    handleSetPrevious,
    room,
    isScrollAbove,
    handleSetIsScrollAbove,
  } = useContext(LobbyWebsocketContext);
  return {
    handleSendMessage,
    readyState,
    nextReference,
    handleSetNextReference,
    shouldScrollToBottom,
    displayLatestMessage,
    cleanShouldScrollToBottom,
    handleSetShouldScrollToBottom,
    handleNewList,
    handleNewMessages,
    handleSetMessageList,
    isLatestMessageExist,
    displayMessageList,
    next,
    previous,
    handleSetNext,
    handleSetPrevious,
    room,
    isScrollAbove,
    handleSetIsScrollAbove,
  };
};
