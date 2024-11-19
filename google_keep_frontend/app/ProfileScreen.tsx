import React, { useEffect, useState } from 'react';
import {View, Text, Image, StyleSheet, Button} from 'react-native';
import Cookies from 'universal-cookie'; // Import cookies library
import GoogleSignIn from "./GoogleSignIn";
import {auth} from "@/firebaseConfig";
import {router} from "expo-router";


export default function ProfileScreen() {

    interface UserInfo {
        picture: string;
        name: string;
        email: string;
    }

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const cookies = new Cookies();

    useEffect(() => {
        const cookies = new Cookies();
        const userData = cookies.get('user');
        console.log('User data from cookies:', userData);

        if (userData) {
            try {
                const parsedUserData: UserInfo = typeof userData === 'string' ? JSON.parse(userData) : userData;
                setUserInfo(parsedUserData); // Update the state with parsed data
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []); // Empty dependency array ensures it runs once after the initial render

    if (!userInfo) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No user info available. Please sign in.</Text>
            </View>
        );
    }

    const signOut = async () => {
        try {
            cookies.remove('user', { path: '/' });
            await auth.signOut();
            setUserInfo(null);
            console.log('Sign out successful');
            router.push('/GoogleSignIn');
        } catch (e) {
            console.error('Sign out error:', e);
            // @ts-ignore
            setError(e.message);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: userInfo.picture }} style={styles.profileImage} />
            <Text style={styles.profileName}>{userInfo.name}</Text>
            <Text style={styles.profileEmail}>{userInfo.email}</Text>
            <Button title="Sign Out" onPress={signOut} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    text: {
        fontSize: 16,
        color: '#757575',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    profileEmail: {
        fontSize: 16,
        color: '#757575',
    },
});
