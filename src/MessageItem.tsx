import { Avatar } from "@mui/material";
import { TWhiteboardMessage } from "protico-sdk";
import React, { useEffect, useRef, useState } from "react";

import { useLobbyWebsocket } from "./hooks/useLobbyWebsocket";
import { getProticoClient } from "./utils/api";
import { useProticoAuth } from "./hooks/useProticoAuth";
import {
  convertTo12HourFormat,
  decodeAssetUrl,
  isAssetUrl,
  isListUrl,
} from "./utils/format";
import useBasicProfile from "./hooks/useBasicProfile";

interface IProps {
  message: TWhiteboardMessage;
  displayAvatar: boolean;
}
const MessageItem = ({ message, displayAvatar }: IProps) => {
  const { address } = useProticoAuth();
  const { basicProfile } = useBasicProfile(message.sender);
  const { basicProfile: referenceProfile } = useBasicProfile(
    message.referenced_message?.sender ?? null
  );
  const [copyButtonText, setCopyButtonText] = useState("Copy");

  const isMe = message.sender.toLowerCase() === address;
  const [isHovered, setIsHovered] = useState(false);
  const {
    handleSetNextReference,
    handleSetMessageList,
    handleSetNext,
    handleSetPrevious,
    room,
  } = useLobbyWebsocket();
  const [isTop, setIsTop] = useState(true);
  const messageItemRef = useRef<HTMLDivElement>(null);

  const onReferenceClick = async () => {
    if (!message.referenced_message?.id) return;
    if (!room) return;
    const referenceMessageId = message.referenced_message.id;

    const res = await getProticoClient().whiteboard.getMessages({
      referenceMessageId,
      room,
    });
    const resMessages = res.data.results;
    if (resMessages.length !== 0) {
      handleSetNext(res.data.next);
      handleSetPrevious(res.data.previous);

      handleSetMessageList(resMessages);
    } else {
      handleSetNext(null);
      handleSetPrevious(null);
    }
    const maxAttempts = 20;
    let attempts = 0;
    // Define a function to check for the element
    const checkForElement = () => {
      attempts += 1;
      // Find the element by its unique id
      const element = document.getElementById(
        `chat-message-content-${referenceMessageId}`
      );

      // If the element exists, scroll to it
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          // Add the 'msg-item-shining-effect' class
          element.classList.add("msg-item-shining-effect");
        }, 100);

        // Remove the 'msg-item-shining-effect' class after 1 second
        setTimeout(() => {
          element.classList.remove("msg-item-shining-effect");
        }, 2000);
      } else if (attempts < maxAttempts) {
        // If the element does not exist, check again after a short delay
        setTimeout(checkForElement, 100);
      }
    };

    // Start checking for the element
    checkForElement();
  };

  const onReferenceActionClick = () => {
    handleSetNextReference({
      message_id: message.id,
      sender: message.sender,
      messageText:
        isAssetUrl(message.messageText) || isListUrl(message.messageText)
          ? "[Image]"
          : message.messageText,
    });
  };

  const onCopyActionClick = () => {
    navigator.clipboard.writeText(message.messageText).then(
      () => {
        setCopyButtonText("Copied!");
        setTimeout(() => {
          setCopyButtonText("Copy");
        }, 3000);
      },
      function (err) {
        console.error("Could not copy text: ", err);
      }
    );
  };

  useEffect(() => {
    const checkPosition = () => {
      if (messageItemRef.current) {
        const rect = messageItemRef.current.getBoundingClientRect();
        setIsTop(rect.top >= 200);
      }
    };
    checkPosition();
    window.addEventListener("resize", checkPosition);
    const scrollableDiv = document.getElementById("scrollableDiv");
    scrollableDiv?.addEventListener("scroll", checkPosition);

    return () => {
      window.removeEventListener("resize", checkPosition);
      scrollableDiv?.removeEventListener("scroll", checkPosition);
    };
  }, []);

  return (
    <div ref={messageItemRef} id={`chat-message-content-${message.id}`}>
      <div className="flex flex-row pt-3">
        <div className="pl-4">
          {displayAvatar ? (
            <Avatar
              alt="PFP"
              src={basicProfile?.avatar_url}
              sx={{ width: 35, height: 35 }}
              variant="rounded"
            />
          ) : (
            <div className="w-[35px]"></div>
          )}
        </div>

        <div className="pl-4">
          {displayAvatar && (
            <header className="pb-1 flex flex-row">
              <h3 className=" text-sm font-extrabold leading-4">
                {message.sender
                  ? basicProfile?.name || message.sender
                  : "Guest"}
              </h3>
              <div className="pl-3 flex justify-center items-center">
                <p className=" text-sm">
                  {convertTo12HourFormat(message.createdAt)}
                </p>
              </div>
            </header>
          )}
          <div
            className="lobby-message-item"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* {!!message.message_reference?.message_id &&
              !!message.referenced_message && (
                <header
                  className="lobby-message-item-reference-header"
                  onClick={onReferenceClick}
                >
                  <div className="lobby-message-item-reference-avatar">
                    <Avatar
                      alt="PFP"
                      src={referenceProfile?.avatar_url}
                      sx={{ width: 25, height: 25 }}
                    />
                  </div>
                  <div className="lobby-message-item-reference-content">
                    <h3>
                      {message.referenced_message.sender
                        ? referenceProfile?.name ||
                          message.referenced_message.sender
                        : "Guest"}
                    </h3>
                    <p>
                      {isAssetUrl(message.referenced_message.messageText) ||
                      isListUrl(message.referenced_message.messageText)
                        ? "IMAGE"
                        : message.referenced_message.messageText}
                    </p>
                  </div>
                </header>
              )} */}

            <p className=" leading-4 pt-1">
              {isAssetUrl(message.messageText) ? (
                <img
                  src={decodeAssetUrl(message.messageText)[0]}
                  style={{ maxWidth: "50px" }}
                />
              ) : isListUrl(message.messageText) ? (
                <img
                  src={decodeAssetUrl(message.messageText)[0]}
                  style={{ maxWidth: "50px" }}
                />
              ) : (
                message.messageText
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
