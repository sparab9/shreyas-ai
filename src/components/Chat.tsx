import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { BsChevronDown, BsPlusLg } from "react-icons/bs";
import { RxHamburgerMenu } from "react-icons/rx";
import useAutoResizeTextArea from "@/hooks/useAutoResizeTextArea";
import Message from "./Message";
import { DEFAULT_OPENAI_MODEL } from "@/shared/Constants";
import { Tooltip } from "react-tooltip";

const Chat = (props: any) => {
  const { toggleComponentVisibility } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmptyChat, setShowEmptyChat] = useState(false);
  const [message, setMessage] = useState("");
  const textAreaRef = useAutoResizeTextArea();
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  const selectedModel = DEFAULT_OPENAI_MODEL;
  const [conversation, setConversation] = useState<any[]>([
    { content: props.StartMessage, role: "system" },

  ]);
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "24px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message, textAreaRef]);

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const sendMessage = async (e: any) => {
    e.preventDefault();

    // Don't send empty messages
    if (message.length < 1) {
      setErrorMessage("Please enter a message.");
      return;
    } else {
      setErrorMessage("");
    }

    setIsLoading(true);

    // Add the message to the conversation
    setConversation([
      ...conversation,
      { content: message, role: "user" },
      { content: null, role: "system" },
    ]);

    // Clear the message & remove empty chat
    setMessage("");
    setShowEmptyChat(false);

    try {
      const response = await fetch(`/api/openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemPrompt: props.SystemPrompt,
          messages: [...conversation, { content: message, role: "user" }],
          model: selectedModel,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Add the message to the conversation
        setConversation([
          ...conversation,
          { content: message, role: "user" },
          { content: data.message, role: "system" },
        ]);
      } else {
        console.error(response);
        setErrorMessage(response.statusText);
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);

      setIsLoading(false);
    }
  };

  const handleKeypress = (e: any) => {
    // It's triggers by pressing the enter key
    if (e.keyCode == 13 && !e.shiftKey) {
      sendMessage(e);
      e.preventDefault();
    }
  };

  return (
    <div className="flex max-w-full flex-1 flex-col bg-gray-800 text-gray-200">
    <div className="sticky top-0 z-10 flex items-center border-b border-white/20 pl-1 pt-1 sm:pl-3 md:hidden">
      <button
        type="button"
        className="-ml-0.5 -mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:text-white"
        onClick={toggleComponentVisibility}
      >
        <span className="sr-only">Open sidebar</span>
        <RxHamburgerMenu className="h-6 w-6" />
      </button>
      <h1 className="flex-1 text-center text-base font-normal">New chat</h1>
    </div>
    <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
      <div className="flex-1 overflow-hidden bg-gray-800">
        <div className="react-scroll-to-bottom--css-ikyem-79elbk h-full">
          <div className="react-scroll-to-bottom--css-ikyem-1n7m0yu">
            {!showEmptyChat && conversation.length > 0 ? (
              <div className="flex flex-col items-center text-sm">
                <div className="flex w-full items-center justify-center gap-1 border-b p-3 border-gray-900/50 bg-gray-700 text-gray-300">
                  Model: {selectedModel.name}
                </div>
                {conversation.map((message, index) => (
                  <Message key={index} message={message} />
                ))}
                <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
                <div ref={bottomOfChatRef}></div>
              </div>
            ) : null}
            {showEmptyChat ? (
              <div className="py-10 relative w-full flex flex-col h-full">
                <div className="flex items-center justify-center gap-2">
                  <div className="relative w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                    <button
                      className="relative flex w-full cursor-default flex-col rounded-md border py-2 pl-3 pr-10 text-left focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 border-white/20 bg-gray-800 sm:text-sm align-center"
                      id="headlessui-listbox-button-:r0:"
                      type="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                      data-headlessui-state=""
                      aria-labelledby="headlessui-listbox-label-:r1: headlessui-listbox-button-:r0:"
                    >
                      <label
                        className="block text-xs text-gray-500 text-center"
                        id="headlessui-listbox-label-:r1:"
                        data-headlessui-state=""
                      >
                        Uses GPT-3.5
                      </label>
                      <span className="inline-flex w-full truncate">
                        <span className="flex h-6 items-center gap-1 truncate">
                          {selectedModel.name}
                        </span>
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <BsChevronDown className="h-4 w-4 text-gray-400" />
                      </span>
                    </button>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-4xl font-semibold text-center text-gray-600 flex gap-2 items-center justify-center h-screen">
                  ShreyasGPT
                </h1>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0 border-white/20 md:border-transparent md:bg-vert-light-gradient pt-2" data-tooltip-id="textbox" data-tooltip-html="Sample Questions: <br /> Where did Shreyas go to college? <br /> Where has Shreyas worked in the past 4 years?" data-tooltip-delay-show={700}>
        <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
          <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
            {errorMessage ? (
              <div className="mb-2 md:mb-0">
                <div className="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center">
                  <span className="text-red-500 text-sm">{errorMessage}</span>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-gray-900/50 text-white bg-gray-700 rounded-md shadow-[0_0_15px_rgba(0,0,0,0.10)]">
              <textarea
                ref={textAreaRef}
                value={message}
                tabIndex={0}
                data-id="root"
                style={{
                  height: "24px",
                  maxHeight: "200px",
                  overflowY: "hidden",
                }}
                placeholder="Ask me a question about Shreyas"
                className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 bg-transparent pl-2 md:pl-0"
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeypress}
              ></textarea>
              <button
                disabled={isLoading || message?.length === 0}
                onClick={sendMessage}
                className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-gray-500 right-1 md:right-2 disabled:opacity-40"
              >
                <FiSend className="h-4 w-4 mr-1" />
              </button>
            </div>
          </div>
        </form>
        <div className="px-3 pt-2 pb-3 text-center text-xs text-white/50 md:px-4 md:pt-3 md:pb-6">
          <span>
            ❤ to <a
            target="https://github.com/Monte9/nextjs-tailwindcss-chatgpt-clone"
            href="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-400"
          >open source projects</a> and  <a
          target="https://www.openai.com"
          href="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-400"
        >OpenAI</a> which make this possible.
          </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;








