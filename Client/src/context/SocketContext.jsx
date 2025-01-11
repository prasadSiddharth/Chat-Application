import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const { userInfo } = useAppStore();

    useEffect(() => {
        if (userInfo) {
            console.log("Initializing socket connection...");
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id },
            });

            socket.current.on("connect", () => {
                console.log("Connected to socket server");
            });

            const handleReceiveMessage = (message) => {
                const {
                    selectedChatData,
                    selectedChatType,
                    addMessage,
                    addContactsInDMContacts,
                } = useAppStore.getState();
                if (
                    selectedChatType !== undefined &&
                    (selectedChatData._id === message.sender._id ||
                        selectedChatData._id === message.recipient._id)
                ) {
                    console.log("Message Received: ", message);
                    addMessage(message);
                }
                addContactsInDMContacts(message);
            };

            const handleReceiveChannelMessage = (message) => {
                const {
                    selectedChatData,
                    selectedChatType,
                    addMessage,
                    addChannelInChannelList,
                } = useAppStore.getState();
                if (
                    selectedChatType !== undefined &&
                    selectedChatData._id === message.channelId
                ) {
                    console.log("Channel Message Received: ", message);
                    addMessage(message);
                }
                addChannelInChannelList(message);
            };

            socket.current.on("receiveMessage", handleReceiveMessage);
            socket.current.on(
                "receive-channel-message",
                handleReceiveChannelMessage
            );

            return () => {
                console.log("Disconnecting socket...");
                if (socket.current) {
                    socket.current.disconnect();
                }
            };
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
};
