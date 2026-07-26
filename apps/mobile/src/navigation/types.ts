export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: undefined;
  MainTabs: undefined;
  ChatThread: {
    chatId: string;
    title: string;
  };
};

export type MainTabParamList = {
  Chats: undefined;
  Devices: undefined;
  Settings: undefined;
};
