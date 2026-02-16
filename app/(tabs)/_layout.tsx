import { Entypo } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-book"
        options={{
          title: "Add Book",
          tabBarIcon: ({ color }) => <Entypo name="add-to-list" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="request-book"
        options={{
          title: "Request Book",
          tabBarIcon: ({ color }) => <Entypo name="book" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <Entypo name="user" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
