import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { FaTrash, FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { colors } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
    ADD_PROFILE_IMAGE_ROUTE,
    UPDATE_PROFILE_ROUTE,
    REMOVE_PROFILE_IMAGE_ROUTE,
} from "@/utils/constants";
import { useRef } from "react";
import { HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";

function Profile() {
    const navigate = useNavigate();
    const { userInfo, setUserInfo } = useAppStore();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [image, setImage] = useState(null);
    const [hovered, setHovered] = useState(false);
    const [selectedColor, setSelectedColor] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (userInfo.profileSetup) {
            setFirstName(userInfo.firstName);
            setLastName(userInfo.lastName);
            setSelectedColor(userInfo.color);
        }
        if (userInfo.image) {
            setImage(`${HOST}/${userInfo.image}`);
        }
    }, [userInfo]);

    const validateProfile = async () => {
        if (!firstName || !lastName) {
            toast.error("First Name and Last Name are required!");
            return false;
        }
        return true;
    };

    const saveChanges = async () => {
        if (validateProfile()) {
            try {
                const response = await apiClient.post(
                    UPDATE_PROFILE_ROUTE,
                    {
                        firstName,
                        lastName,
                        image,
                        color: selectedColor,
                    },
                    { withCredentials: true }
                );

                if (response.status === 201) {
                    setUserInfo(response.data);
                    toast.success("Profile Updated Successfully!");
                    navigate("/chat");
                }
            } catch (err) {
                console.log(err.message);
                toast.error("Internal Server Error!");
            }
        }
    };

    const handleNavigate = () => {
        if (userInfo.profileSetup) {
            navigate("/chat");
        } else {
            toast.error("Please complete your profile setup!");
        }
    };

    const handleFileInputClick = () => {
        fileInputRef.current.click();
    };

    // const handleImageChange = async (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         console.log("Image Received: ", file);
    //         const formData = new FormData();
    //         formData.append("profile-image", file);
    //         const response = await apiClient.post(
    //             ADD_PROFILE_IMAGE_ROUTE,
    //             formData,
    //             {
    //                 withCredentials: true,
    //             }
    //         );

    //         if (response.status === 200 && response.data.image) {
    //             setUserInfo({ ...userInfo, image: response.data.image });
    //             toast.success("Profile Image Updated Successfully!");
    //         }
    //         const reader = new FileReader();
    //         reader.onload = () => {
    //             setImage(reader.result);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Image Received: ", file);
            const formData = new FormData();
            formData.append("profile-image", file);

            try {
                const response = await apiClient.post(
                    ADD_PROFILE_IMAGE_ROUTE,
                    formData,
                    {
                        withCredentials: true,
                    }
                );

                if (response.status === 200 && response.data.image) {
                    setUserInfo({ ...userInfo, image: response.data.image });
                    toast.success("Profile Image Updated Successfully!");

                    const reader = new FileReader();
                    reader.onload = () => {
                        setImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                } else {
                    toast.error("Error: Image update failed");
                }
            } catch (err) {
                console.log(err.message);
                toast.error("Internal Server Error!");
            }
        }
    };


    const handleDeleteImage = async () => {
        try {
            const response = await apiClient.delete(
                REMOVE_PROFILE_IMAGE_ROUTE,
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setUserInfo({ ...userInfo, image: null });
                toast.success("Profile Image Removed Successfully!");
                setImage(null);
            }
        } catch (err) {
            console.log(err.message);
            toast.error("Internal Server Error!");
        }
    };

    return (
        <div>
            <div className="bg-[#1b1c24] h-[100vh] flex justify-center items-center flex-col gap-10">
                <div className="flex flex-col gap-10 w-[80vw] md:w-max">
                    <div onClick={handleNavigate}>
                        <IoArrowBack className="text-4xl lg:text-6xl text-white text-opacity-90 cursor-pointer" />
                    </div>
                    <div className="grid grid-cols-2">
                        <div
                            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}>
                            <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-full overflow-hidden">
                                {image ? (
                                    <AvatarImage
                                        src={image}
                                        alt="profileImage"
                                        className="object-cover w-full h-full bg-black"
                                    />
                                ) : (
                                    <div
                                        className={`uppercase h-32 w-32 md:h-48 md:w-48 text-5xl border-[1px] flex items-center justify-center rounded-full
                  ${getColor(selectedColor)} `}>
                                        {firstName
                                            ? firstName.split("").shift()
                                            : userInfo.email.split("").shift()}
                                    </div>
                                )}
                            </Avatar>
                            {hovered && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black opacity-50 rounded-full cursor-pointer"
                                    onClick={
                                        image
                                            ? handleDeleteImage
                                            : handleFileInputClick
                                    }>
                                    {image ? (
                                        <FaTrash className="text-white text-3xl cursor-pointer" />
                                    ) : (
                                        <FaPlus className="text-white text-3xl cursor-pointer" />
                                    )}
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleImageChange}
                                name="profile-image"
                                accept=".png, .jpg, .jpeg, .svg, .webp"
                            />
                        </div>
                        <div className="flex m-w-32 md:min-w-64 flex-col gap-5 items-center justify-center">
                            <div className="w-full">
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    disabled
                                    value={userInfo.email}
                                    className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                                />
                            </div>
                            <div className="w-full">
                                <Input
                                    placeholder="First Name"
                                    type="text"
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    value={firstName}
                                    className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                                />
                            </div>
                            <div className="w-full">
                                <Input
                                    placeholder="Last Name"
                                    type="text"
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    value={lastName}
                                    className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                                />
                            </div>
                            <div className="w-full flex gap-5">
                                {colors.map((color, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedColor(index)}
                                        className={`h-8 w-8 rounded-full cursor-pointer 
                    ${color} ${
                                            selectedColor === index
                                                ? "outline outline-white/50 outline-1"
                                                : ""
                                        } transition-all duration-300`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <Button
                            className="h-16 w-full bg-purple-700 hover:bg-purple-900 
          transition-all duration-300"
                            onClick={saveChanges}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
