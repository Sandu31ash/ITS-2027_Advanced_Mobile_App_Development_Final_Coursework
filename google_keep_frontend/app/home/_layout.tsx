import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {router} from "expo-router";
import React from "react";

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                screenOptions={({ route }) => ({
                    header: ({ navigation }) => {
                        // Customize header based on route
                        const getPlaceholder = () => {
                            switch (route.name) {
                                case 'homePage':
                                    return 'Search your notes';
                                case 'reminders':
                                    return 'Search reminders';
                                case 'archive':
                                    return 'Search archive';
                                case 'trash':
                                    return 'Search trash';
                                default:
                                    return 'Search';
                            }
                        };

                        const getHeaderStyle = () => {
                            switch (route.name) {
                                case 'homePage':
                                    return '#ededed';  // Light gray background for search bar
                                case 'reminders':
                                    return '#ffffff';
                                case 'archive':
                                    return '#ffffff';
                                case 'trash':
                                    return '#ffffff';
                                default:
                                    return '#ffffff';
                            }
                        };

                        return (
                            <View style={styles.headerContainer}>
                                <View style={[
                                    styles.searchBar,
                                    { backgroundColor: getHeaderStyle() }
                                ]}>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => navigation.openDrawer()}
                                    >
                                        <Icon name="menu" size={30} color="#000" />
                                    </TouchableOpacity>

                                    <TextInput
                                        placeholder={getPlaceholder()}
                                        style={styles.searchInput}
                                        onChangeText={(text) => router.push({
                                            pathname: '/home/homePage',
                                            params: { searchText: text }
                                        })}
                                    />

                                    {route.name === 'homePage' ? (
                                        <TouchableOpacity style={styles.iconButton}
                                                          onPress={() => router.push('../ProfileScreen')}

                                        >
                                            <Icon name="account-circle" size={30} color="#000" />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity style={styles.iconButton}>
                                            <Icon name="search" size={24} color="#5f6368" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    },
                    drawerStyle: {
                        backgroundColor: '#fff',
                    },
                    drawerLabelStyle: {
                        marginLeft: 10,
                    },
                    drawerActiveTintColor: '#1a73e8',
                    drawerInactiveTintColor: '#202124',
                    drawerItemStyle: {
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                        marginVertical: 0,
                        marginHorizontal: 0,
                    },
                    pressColor: '#e8f0fe',
                    pressOpacity: 0.8
                })}
            >
                <Drawer.Screen
                    name="homePage"
                    options={{
                        drawerLabel: "Notes",
                        drawerIcon: ({ color, size }) => (
                            <Icon name="note" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="reminders"
                    options={{
                        drawerLabel: "Reminders",
                        drawerIcon: ({ color, size }) => (
                            <Icon name="notifications" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="createNewLabel"
                    options={{
                        drawerLabel: "Create new label",
                        drawerIcon: ({ color, size }) => (
                            <Icon name="add" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="archive"
                    options={{
                        drawerLabel: "Archive",
                        drawerIcon: ({ color, size }) => (
                            <Icon name="archive" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="trash"
                    options={{
                        drawerLabel: "Trash",
                        drawerIcon: ({ color, size }) => (
                            <Icon name="delete" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="settings"
                    options={{
                        drawerLabel: "Settings",
                        drawerIcon: ({ color, size }) => (
                            <Icon name="settings" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="helpFeedback"
                    options={{
                        drawerLabel: "Help & feedback",
                        drawerIcon: ({ color, size }) => (
                            <Icon name="help" size={size} color={color} />
                        ),
                    }}
                />
            </Drawer>

        </GestureHandlerRootView>
    );
}




const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#ffffff',
        paddingTop: 50,
        paddingHorizontal: 10,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 5,
        justifyContent: "space-between",
        borderRadius: 35,
    },
    iconButton: {
        padding: 10,
    },
    searchInput: {
        flex: 1,
        marginHorizontal: 10,
        fontSize: 16,
    },
});
