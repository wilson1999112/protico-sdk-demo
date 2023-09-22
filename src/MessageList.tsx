import { TWhiteboardMessage } from "protico-sdk";
import React, { useEffect, useRef } from "react";
import InfiniteScroll from "./components/InfiniteScroll";
import { useLobbyWebsocket } from "./hooks/useLobbyWebsocket";
import MessageItem from "./MessageItem";
import api, { getProticoClient } from "./utils/api";
const MessageList = ({ room }: { room: string }) => {
  const {
    displayMessageList,
    handleNewMessages,
    handleSetMessageList,
    next,
    previous,
    handleSetNext,
    handleSetPrevious,
    handleSetIsScrollAbove,
    shouldScrollToBottom,
    cleanShouldScrollToBottom,
  } = useLobbyWebsocket();

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };
  useEffect(() => {
    if (shouldScrollToBottom) {
      setTimeout(() => {
        scrollToBottom();
      }, 0);
      cleanShouldScrollToBottom();
    }
  }, [shouldScrollToBottom]);

  const fetchDataInit = async () => {
    let messages: TWhiteboardMessage[] = [];
    try {
      const response = await getProticoClient().whiteboard.getMessages({
        page_size: 200,
        room,
      });
      messages = response.data.results;
      if (messages.length !== 0) {
        handleSetNext(response.data.next);
        handleSetPrevious(response.data.previous);
      } else {
        handleSetNext(null);
        handleSetPrevious(null);
      }
    } catch (err) {}
    handleSetMessageList(messages);
  };

  const fetchData = async () => {
    console.log("fetchData: ", next);
    if (!next) return;
    try {
      const response = await api.get(next);
      const resMessages = response.data.results as TWhiteboardMessage[];
      if (resMessages.length !== 0) {
        handleSetNext(response.data.next);
        handleNewMessages(resMessages);
      } else {
        handleSetNext(null);
      }
    } catch (err) {
      return;
    }
  };
  const fetchPreviousData = async () => {
    if (!previous) return;
    try {
      const response = await api.get(previous);
      const resMessages = response.data.results as TWhiteboardMessage[];
      if (resMessages.length !== 0) {
        handleSetPrevious(response.data.previous);
        handleNewMessages(resMessages);
      } else {
        handleSetPrevious(null);
      }
    } catch (err) {
      return;
    }
  };
  useEffect(() => {
    fetchDataInit().then(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    });
  }, [room]);

  return (
    <div
      id="scrollableDiv"
      className="flex-1 flex flex-col-reverse overflow-y-scroll"
    >
      <div ref={messagesEndRef} className="pb-6 flex-1"></div>
      {displayMessageList?.length > 0 ? (
        <InfiniteScroll
          dataLength={displayMessageList?.length || 0}
          next={fetchData}
          previous={fetchPreviousData}
          style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
          inverse={true}
          hasMore={!!next}
          hasPrevious={!!previous}
          setIsScrollAbove={handleSetIsScrollAbove}
          loader={<h4 style={{ textAlign: "center" }}>Loading...</h4>}
          scrollableTarget="scrollableDiv"
          // scrollThreshold="300px"
        >
          {displayMessageList.map((m: TWhiteboardMessage, index) => {
            let displayAvatar = false;
            if (index === displayMessageList.length - 1) {
              displayAvatar = true;
            } else if (displayMessageList[index + 1].sender !== m.sender) {
              displayAvatar = true;
            }
            return (
              <MessageItem
                key={`MessageItem_key_-${m.id}`}
                message={m}
                displayAvatar={displayAvatar}
              />
            );
          })}
        </InfiniteScroll>
      ) : (
        <div className="flex flex-1 justify-center items-center">
          <p>There are no messages yet.</p>
        </div>
      )}
      {/* <div className="pb-6" /> */}
    </div>
  );
};
export default MessageList;
