import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ReadyState, useSocketIO } from "react-use-websocket";
import { useProticoAuth } from "../../hooks/useProticoAuth";

import { getProticoClient } from "../../utils/api";

export interface IMessageReference {
  message_id: string;
  sender: string;
  messageText: string;
}

interface ILobbyWebsocketContext {
  handleSendMessage: (text: string) => void;
  handleNewList: (
    text: string,
    data: any,
    sign: any,
    hash: any,
    chainId: string
  ) => void;
  readyState: ReadyState;
  handleSetNextReference: (message_reference: IMessageReference | null) => void;
  nextReference: IMessageReference | null;
  displayLatestMessage: any;
  shouldScrollToBottom: boolean;
  cleanShouldScrollToBottom: () => void;
  handleSetShouldScrollToBottom: () => void;
  handleSetMessageList: (newMessageList: any[]) => void;
  handleNewMessages: (newMessageList: any[]) => void;
  isLatestMessageExist: boolean;
  displayMessageList: any[];
  next: string | null;
  previous: string | null;
  handleSetNext: (next: string | null) => void;
  handleSetPrevious: (previous: string | null) => void;
  room: string | null;
  isScrollAbove: boolean;
  handleSetIsScrollAbove: (isScrollAbove: boolean) => void;
}

export const LobbyWebsocketContext =
  React.createContext<ILobbyWebsocketContext>({
    handleSendMessage: () => {},
    handleNewList: () => {},
    readyState: ReadyState.CONNECTING,
    handleSetNextReference: () => {},
    nextReference: null,
    displayLatestMessage: null,
    shouldScrollToBottom: false,
    cleanShouldScrollToBottom: () => {},
    handleSetShouldScrollToBottom: () => {},
    handleSetMessageList: () => {},
    handleNewMessages: () => {},
    isLatestMessageExist: false,
    displayMessageList: [],
    next: null,
    previous: null,
    handleSetNext: () => {},
    handleSetPrevious: () => {},
    room: null,
    isScrollAbove: false,
    handleSetIsScrollAbove: () => {},
  });

export const LobbyWebsocketProvider = ({
  room,
  roomDomain,
  roomUrl,
  children,
}: {
  room: string | null;
  roomDomain: string | null;
  roomUrl: string | null;
  children: React.ReactNode;
}) => {
  //Public API that will echo messages sent to it back to the client
  const { address } = useProticoAuth();
  const [nextReference, setMessageReference] =
    useState<IMessageReference | null>(null);
  const { lastMessage, readyState, sendMessage } = useSocketIO(
    "ws://localhost:4100",
    {
      onOpen: () => {
        console.log("lobby socket opened");
        sendMessage(`42["join",{"room":"${room}"}]`);
      },
      //Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: 10,
      //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
    }
  );

  const [displayLatestMessage, setDisplayLatestMessage] = useState<any>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] =
    useState<boolean>(false);
  const [isScrollAbove, setIsScrollAbove] = useState<boolean>(false);

  const [messageList, setMessageList] = useState<any[]>([]);
  const displayMessageList = useMemo(() => {
    return messageList;
  }, [JSON.stringify(messageList)]);
  const [latestMessageseen, setLatestMessageseen] = useState<any>(null);
  const [isLatestMessageExist, setIsLatestMessageExist] =
    useState<boolean>(true);

  const [next, setNext] = React.useState<string | null>(null);
  const [previous, setPrevious] = React.useState<string | null>(null);

  useEffect(() => {
    if (lastMessage !== null) {
      if (lastMessage.type === "message") {
        if (isLatestMessageExist) {
          handleNewMessages([lastMessage.payload]);
          if (!isScrollAbove) {
            setShouldScrollToBottom(true);
          }
        }
        if (isScrollAbove || !isLatestMessageExist)
          setDisplayLatestMessage(lastMessage.payload);
      }
    }
  }, [lastMessage]);
  const cleanDisplayLatestMessage = useCallback(() => {
    setDisplayLatestMessage(null);
  }, []);
  useEffect(() => {
    if (!isScrollAbove) {
      cleanDisplayLatestMessage();
    }
  }, [isScrollAbove]);

  const postSendMessage = useCallback(
    (data: any, room: string, roomDomain: string, roomUrl: string) =>
      getProticoClient().whiteboard.postMessage(
        data,
        room,
        roomDomain,
        roomUrl
      ),
    [address]
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      if (!room || !roomDomain || !roomUrl) return;
      const payloadDict = {
        messageText: text,
      } as any;
      if (nextReference) {
        payloadDict.message_reference = nextReference;
      }
      const payload = payloadDict as unknown as any;
      postSendMessage(
        { payload, type: "new_message" },
        room,
        roomDomain,
        roomUrl
      );
      setMessageReference(null);
    },
    [nextReference, postSendMessage, room, roomDomain, roomUrl]
  );

  const handleSetNextReference = useCallback(
    (message_reference: IMessageReference | null) => {
      setMessageReference(message_reference);
    },
    []
  );

  const handleNewList = useCallback(
    (text: string, data: any, sign: any, hash: any, chainId: string) => {
      if (!room || !roomDomain || !roomUrl) return;
      postSendMessage(
        {
          type: "new_list",
          payload: {
            messageText: text,
          },
          typeddata: {
            data: data,
            sign: sign,
            hash: hash,
            chainId: chainId,
          },
        },
        room,
        roomDomain,
        roomUrl
      );
      setMessageReference(null);
    },
    [postSendMessage, room, roomDomain, roomUrl]
  );
  const cleanShouldScrollToBottom = useCallback(() => {
    setShouldScrollToBottom(false);
  }, []);
  const handleSetShouldScrollToBottom = useCallback(() => {
    setShouldScrollToBottom(true);
  }, []);

  const getTimeFromCreatedAt = (message: any) =>
    new Date(message.createdAt).getTime();

  const isNewMessage = (latestMessageseen: any, newMessage: any) => {
    return (
      latestMessageseen === null ||
      getTimeFromCreatedAt(newMessage) > getTimeFromCreatedAt(latestMessageseen)
    );
  };

  const handleSetMessageList = useCallback(
    (newMessageList: any[]) => {
      setMessageList(newMessageList);
      if (
        newMessageList.length > 0 &&
        isNewMessage(latestMessageseen, newMessageList[0])
      ) {
        setLatestMessageseen(newMessageList[0]);
      }
    },
    [latestMessageseen?.id]
  );

  const getUniqueMessages = (
    newMessageList: any[],
    currentMessageList: any[]
  ) => {
    const seen = new Set(currentMessageList.map((msg) => msg.id));
    return newMessageList.filter((msg) => !seen.has(msg.id));
  };

  const sortMessages = (messageList: any[]) => {
    return messageList.sort(
      (a, b) => getTimeFromCreatedAt(b) - getTimeFromCreatedAt(a)
    );
  };

  const handleNewMessages = useCallback(
    (newMessageList: any[]) => {
      const uniqueMessages = getUniqueMessages(newMessageList, messageList);
      const newList = sortMessages([...messageList, ...uniqueMessages]);

      setMessageList(newList);
      if (newList.length > 0 && isNewMessage(latestMessageseen, newList[0])) {
        setLatestMessageseen(newList[0]);
      }
    },
    [JSON.stringify(messageList), latestMessageseen?.id]
  );

  useEffect(() => {
    if (messageList.length === 0) {
      setIsLatestMessageExist(true);
      return;
    }
    setIsLatestMessageExist(
      messageList.some((msg) => msg.id === latestMessageseen?.id)
    );
  }, [JSON.stringify(messageList), latestMessageseen?.id]);
  const handleSetNext = useCallback((next: string | null) => {
    setNext(next);
  }, []);
  const handleSetPrevious = useCallback((previous: string | null) => {
    setPrevious(previous);
  }, []);
  const handleSetIsScrollAbove = useCallback((isScrollAbove: boolean) => {
    setIsScrollAbove(isScrollAbove);
  }, []);

  return (
    <LobbyWebsocketContext.Provider
      value={{
        handleSendMessage,
        handleNewList,
        readyState,
        handleSetNextReference,
        nextReference,
        displayLatestMessage,
        shouldScrollToBottom,
        cleanShouldScrollToBottom,
        handleSetShouldScrollToBottom,
        handleSetMessageList,
        handleNewMessages,
        isLatestMessageExist,
        displayMessageList,
        next,
        previous,
        handleSetNext,
        handleSetPrevious,
        room,
        isScrollAbove,
        handleSetIsScrollAbove,
      }}
    >
      {children}
    </LobbyWebsocketContext.Provider>
  );
};
