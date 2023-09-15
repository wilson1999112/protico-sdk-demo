import React, { useCallback, useEffect, useRef, useState } from "react";
import { SUPPORTED_ADAPTERS } from "protico-sdk";
import { useForm, SubmitHandler } from "react-hook-form";
import { useLobbyWebsocket } from "./hooks/useLobbyWebsocket";
import SendIcon from "@mui/icons-material/Send";
import { useProticoAuth } from "./hooks/useProticoAuth";
type Inputs = {
  inputText: string;
};

const MessageInput = () => {
  const { handleSendMessage } = useLobbyWebsocket();
  const { isProticoAuthenticated, proticoAuthenticate, connectedAdapterName } =
    useProticoAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const submitNewMessage = (data: { inputText: string }) => {
    handleSendMessage(data.inputText);
    reset({
      inputText: "",
    });
  };
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    submitNewMessage(data);
  };

  return (
    <div className="w-full h-full py-3 px-4">
      <div
        className="border-[1px] border-[#565856] w-full h-full -mt-5 rounded-md bg-[#232529] relative z-10"
        style={{
          boxShadow: "rgb(101 101 101 / 15%) 0px -1px 3px 1px",
        }}
      >
        {connectedAdapterName === SUPPORTED_ADAPTERS.GUEST ||
        isProticoAuthenticated ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-4 pt-2">
              <input
                {...register("inputText", { required: true })}
                className="w-full h-6 text-sm active:border-none focus:outline-none bg-transparent text-slate-200"
                placeholder="發送訊息到此大廳"
              />
            </div>
            <div className="w-full flex justify-end">
              <button type="submit" className="p-0 mr-2">
                <SendIcon
                  sx={{
                    width: "15px",
                    height: "15px",
                  }}
                />
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => proticoAuthenticate()}>
            proticoAuthenticate
          </button>
        )}
      </div>
    </div>
  );
};
export default MessageInput;
