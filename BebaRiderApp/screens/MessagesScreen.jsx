import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Filter, Circle, MessageSquare } from "lucide-react-native";
import BebaText from "../components/atoms/BebaText";
import { Palette, Spacing } from "../constants/theme";

const MOCK_CHATS = [
  {
    id: "1",
    name: "Ester",
    lastMessage: "I am at the gate now, please come down.",
    time: "10:31 AM",
    unread: true,
    orderId: "#WE6K-78RFE4",
    type: "Customer",
  },
  {
    id: "2",
    name: "Makola Fabrics Store",
    lastMessage: "The package is ready for pickup at Stall A12.",
    time: "09:45 AM",
    unread: false,
    orderId: "#RW3E-74ESW4",
    type: "Merchant",
  },
  {
    id: "3",
    name: "Beba Support",
    lastMessage: "Your document verification is complete.",
    time: "Yesterday",
    unread: false,
    orderId: "System",
    type: "Support",
  },
];

const MessagesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Active");

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() =>
        navigation.navigate("ChatThread", {
          name: item.name,
          orderId: item.orderId,
        })
      }
    >
      <View style={styles.avatarContainer}>
        <View
          style={[
            styles.avatarPlaceholder,
            {
              backgroundColor:
                item.type === "Support" ? Palette.secondary : Palette.gray100,
            },
          ]}
        >
          {item.type === "Support" ? (
            <MessageSquare size={20} color={Palette.white} />
          ) : (
            <BebaText category="h4" color={Palette.textPrimary}>
              {item.name.charAt(0)}
            </BebaText>
          )}
        </View>
        {item.unread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeaderRow}>
          <BebaText category="h4" color={Palette.textPrimary}>
            {item.name}
          </BebaText>
          <BebaText category="body4" color={Palette.textSecondary}>
            {item.time}
          </BebaText>
        </View>

        <View style={styles.orderBadge}>
          <BebaText category="body4" color={Palette.primary}>
            {item.orderId}
          </BebaText>
          <Circle size={4} color={Palette.gray400} fill={Palette.gray400} />
          <BebaText category="body4" color={Palette.textSecondary}>
            {item.type}
          </BebaText>
        </View>

        <BebaText
          category="body3"
          color={item.unread ? Palette.textPrimary : Palette.textSecondary}
          numberOfLines={1}
          style={item.unread ? styles.unreadText : null}
        >
          {item.lastMessage}
        </BebaText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Area */}
      <View style={styles.header}>
        <BebaText category="h1" color={Palette.textPrimary}>
          Messages
        </BebaText>
        <TouchableOpacity style={styles.iconButton}>
          <Search size={22} color={Palette.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tabs for Scalability */}
      <View style={styles.tabContainer}>
        {["Active", "Support", "Archive"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <BebaText
              category="h4"
              color={
                activeTab === tab ? Palette.primary : Palette.textSecondary
              }
            >
              {tab}
            </BebaText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={MOCK_CHATS.filter((c) =>
          activeTab === "Active" ? c.type !== "Archive" : c.type === activeTab,
        )}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BebaText category="body3" color={Palette.textSecondary}>
              No {activeTab.toLowerCase()} conversations.
            </BebaText>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.gutter,
    paddingVertical: 15,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.gutter,
    gap: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.gray100,
  },
  tab: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Palette.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: 10,
  },
  chatCard: {
    flexDirection: "row",
    backgroundColor: Palette.surface,
    padding: 15,
    borderRadius: Spacing.borderRadius,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Palette.accent, // Gold unread badge
    borderWidth: 2,
    borderColor: Palette.surface,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  unreadText: {
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 50,
  },
});

export default MessagesScreen;
