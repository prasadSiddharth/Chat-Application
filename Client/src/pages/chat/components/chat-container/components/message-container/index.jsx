import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_ALL_MESSAGES, GET_CHANNEL_MESSAGES_ROUTE } from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { HOST } from "@/utils/constants";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

const MessageContainer = () => {
    const [showImage, setShowImage] = useState(false);
    const [imageURL, setImageURL] = useState(null);

    const {
        selectedChatType,
        selectedChatData,
        userInfo,
        selectedChatMessages,
        setSelectedChatMessages,
        setFileDownloadProgress,
        setIsDownloading,
    } = useAppStore();
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChatMessages]);

    useEffect(() => {
        const getMessages = async () => {
            try {
                const response = await apiClient.post(
                    GET_ALL_MESSAGES,
                    { id: selectedChatData._id },
                    { withCredentials: true }
                );
                if (response.data.messages) {
                    setSelectedChatMessages(response.data.messages);
                }
            } catch (err) {
                console.log(err.message);
            }
        };

        const getChannelMessages = async () => {
            try {
                const response = await apiClient.get(
                    `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`,
                    { withCredentials: true }
                );
                if (response.data.messages) {
                    setSelectedChatMessages(response.data.messages);
                }
            } catch (err) {
                console.log(err.message);
            }
        }

        if (selectedChatData._id) {
            if (selectedChatType === "contact") getMessages();
            if (selectedChatType === "channel") getChannelMessages();
        }
    }, [selectedChatType, selectedChatData, setSelectedChatMessages]);

    const checkIfImage = (filePath) => {
        const imageRegex =
            /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
        return imageRegex.test(filePath);
    };

    const renderMessages = () => {
        let lastDate = null;
        return selectedChatMessages.map((message, index) => {
            const messageDate = moment(message.timestamp).format("YYYY_MM_DD");
            const showDate = messageDate !== lastDate;
            lastDate = messageDate;

            return (
                <div key={index}>
                    {showDate && (
                        <div className="text-center text-gray-500 my-2">
                            {moment(message.timestamp).format("LL")}
                        </div>
                    )}
                    {selectedChatType === "contact" &&
                        renderDMMessages(message)}
                    {selectedChatType === "channel" &&
                        renderChannelMessages(message)}
                </div>
            );
        });
    };

    const downloadFile = async (file) => {
        setIsDownloading(true);
        setFileDownloadProgress(0);
        try {
            const response = await apiClient.get(`${HOST}/${file}`, {
                responseType: "blob",
                onDownloadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;
                    const percentCompleted = Math.round((loaded * 100) / total);
                    setFileDownloadProgress(percentCompleted);
                },
            });

            const urlBlob = window.URL.createObjectURL(
                new Blob([response.data])
            );
            const link = document.createElement("a");
            link.href = urlBlob;
            link.setAttribute("download", file.split("/").pop());
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlBlob);

            setIsDownloading(false);
            setFileDownloadProgress(0);
        } catch (error) {
            console.error("Failed to download file:", error);
            setIsDownloading(false);
        }
    };

    const renderDMMessages = (message) => (
        <div
            className={`${
                message.sender === selectedChatData._id
                    ? "text-left"
                    : "text-right"
            }`}>
            {message.messageType === "text" && (
                <div
                    className={`${message.sender !== selectedChatData._id} 
      ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
      : "bg-[#2a2b33]/5 text-white border-[#ffffff]/20" border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
                    {message.content}
                </div>
            )}
            {message.messageType === "file" && (
                <div
                    className={`${message.sender !== selectedChatData._id} 
      ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
      : "bg-[#2a2b33]/5 text-white border-[#ffffff]/20" border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
                    {checkIfImage(message.fileUrl) ? (
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                setShowImage(true),
                                    setImageURL(message.fileUrl);
                            }}>
                            <img
                                src={`${HOST}/${message.fileUrl}`}
                                height={300}
                                width={300}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                                <MdFolderZip />
                            </span>
                            <span>{message.fileUrl.split("/").pop()}</span>
                            <span
                                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50
          cursor-pointer duration-300 transition-all"
                                onClick={() => downloadFile(message.fileUrl)}>
                                <IoMdArrowRoundDown />
                            </span>
                        </div>
                    )}
                </div>
            )}
            <div className="text-xs text-gray-600">
                {moment(message.timestamp).format("LT")}
            </div>
        </div>
    );

    const renderChannelMessages = (message) => {
        const sender = message.sender;

        return (
            <div
                className={`mt-5 ${
                    message.sender._id === userInfo.id
                        ? "text-left"
                        : "text-right"
                }`}>
                {message.messageType === "text" && (
                    <div
                        className={`${
                            message.sender._id !== userInfo._id
                                ? "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
                                : "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                        } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
                        {message.content}
                    </div>
                )}
                {message.messageType === "file" && (
                    <div
                        className={`${message.sender._id !== userInfo._id} 
                        ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                        : "bg-[#2a2b33]/5 text-white border-[#ffffff]/20" border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
                        {checkIfImage(message.fileUrl) ? (
                            <div
                                className="cursor-pointer"
                                onClick={() => {
                                    setShowImage(true),
                                        setImageURL(message.fileUrl);
                                }}>
                                <img
                                    src={`${HOST}/${message.fileUrl}`}
                                    height={300}
                                    width={300}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                                    <MdFolderZip />
                                </span>
                                <span>{message.fileUrl.split("/").pop()}</span>
                                <span
                                    className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50
                                    cursor-pointer duration-300 transition-all"
                                    onClick={() =>
                                        downloadFile(message.fileUrl)
                                    }>
                                    <IoMdArrowRoundDown />
                                </span>
                            </div>
                        )}
                    </div>
                )}
                {sender._id !== userInfo._id && (
                    <div className="flex items-center justify-start gap-3">
                        <Avatar className="h-8 w-8 rounded-full overflow-hidden">
                            {sender.image ? (
                                <AvatarImage
                                    src={`${HOST}/${sender.image}`}
                                    alt="profile"
                                    className="object-cover w-full h-full bg-black"
                                />
                            ) : (
                                <AvatarFallback
                                    className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${
                                        sender.color || "bg-gray-500 text-white"
                                    }`}>
                                    {sender.firstName
                                        ? sender.firstName.charAt(0)
                                        : sender.email.charAt(0)}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <span className="text-sm text-white/60">{`${sender.firstName} ${sender.lastName}`}</span>
                    </div>
                )}
                <span className="text-xs text-white/60 mt-1">
                    {moment(message.timestamp).format("LT")}
                </span>
            </div>
        );
    };

    return (
        <div
            className="flex-1 overflow-y-auto scrollbar-hidden p-4
    px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
            {renderMessages()}
            <div ref={scrollRef}></div>
            {showImage && (
                <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
                    <div>
                        <img
                            src={`${HOST}/${imageURL}`}
                            className="h-[80vh] w-full bg-cover"
                        />
                    </div>
                    <div className="flex gap-5 fixed top-5 mt-5">
                        <button
                            className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50
                cursor-pointer duration-300 transition-all"
                            onClick={() => downloadFile(imageURL)}>
                            <IoMdArrowRoundDown />
                        </button>
                        <button
                            className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50
                cursor-pointer duration-300 transition-all"
                            onClick={() => {
                                setShowImage(false);
                                setImageURL(null);
                            }}>
                            <IoCloseSharp />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageContainer;
