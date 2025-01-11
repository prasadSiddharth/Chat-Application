import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import {
  GET_ALL_CONTACTS_ROUTES,
  CREATE_CHANNEL_ROUTE,
} from "@/utils/constants";

import { FaPlus } from "react-icons/fa";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData, addChannel } =
    useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        console.log("Fetching all contacts...");
        const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
          withCredentials: true,
        });
        console.log("Contacts fetched successfully:", response.data.contacts);
        setAllContacts(response.data.contacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    getData();
  }, []);

  const createChannel = async () => {
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        console.log("Selected Contacts", selectedContacts);
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTE,
          {
            name: channelName,
            members: selectedContacts.map((contact) => {
              return contact.id;
            }),
          },
          { withCredentials: true }
        );
        console.log("Channel created successfully:", response.data);

        if (response.status === 201) {
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModal(false);
          addChannel(response.data.channel);
        }
      } else {
        console.warn("Channel name or selected contacts are missing.");
      }
    } catch (error) {
      console.log(error.message);
      console.error("Error creating channel:", error);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => {
                console.log("Opening new channel modal");
                setNewChannelModal(true);
              }}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            Create New Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Please fill up the details for a new channel.
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => {
                console.log("Channel name input changed:", e.target.value);
                setChannelName(e.target.value);
              }}
              value={channelName}
            />
          </div>
          <div>
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder="Search Contacts"
              value={selectedContacts}
              onChange={(newSelectedContacts) => {
                console.log("Selected contacts updated:", newSelectedContacts);
                setSelectedContacts(newSelectedContacts);
              }}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600">
                  No results found
                </p>
              }
            />
          </div>
          <div>
            <Button
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
              onClick={createChannel}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;

