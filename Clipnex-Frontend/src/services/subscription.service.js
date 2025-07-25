import { api } from './api';

// Toggle subscription (subscribe/unsubscribe)
export const toggleSubscription = async (channelId) => {
  try {
    const response = await api.post(`/subscription/toggle-subscribe/${channelId}`);
    console.log("Toggle subscription response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error toggling subscription:", error);
    throw error;
  }
};

// Get channel subscribers
export const getChannelSubscribers = async (channelId) => {
  try {
    const response = await api.get(`/subscription/find-subscribers/${channelId}`);
    console.log("Channel subscribers response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching channel subscribers:", error);
    throw error;
  }
};

// Get channels user has subscribed to
export const getSubscribedChannels = async (subscriberId) => {
  try {
    const response = await api.get(`/subscription/find-subscribed-channels/${subscriberId}`);
    console.log("Subscribed channels response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching subscribed channels:", error);
    throw error;
  }
}; 