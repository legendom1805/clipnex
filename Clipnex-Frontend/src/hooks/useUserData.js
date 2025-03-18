import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, updateUserData } from "../store/userSlice";
import axios from "axios";

export const useUserData = () => {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a user in auth state but no currentUser, fetch the user data
    if (user && !currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, currentUser, user]);

  const updateUserProfile = async (userData) => {
    try {
      const response = await axios.patch(
        "/api/v1/users/update-details",
        userData,
        {
          withCredentials: true,
        }
      );
      dispatch(updateUserData(response.data.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const updateUserAvatar = async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axios.patch(
        "/api/v1/users/change-avatar",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      dispatch(updateUserData(response.data.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const updateUserCoverImage = async (coverImageFile) => {
    try {
      const formData = new FormData();
      formData.append("coverImage", coverImageFile);

      const response = await axios.patch(
        "/api/v1/users/change-coverImage",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      dispatch(updateUserData(response.data.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  return {
    currentUser: currentUser || user, // Fallback to auth user if currentUser is not loaded
    loading,
    error,
    updateUserProfile,
    updateUserAvatar,
    updateUserCoverImage,
  };
};
