import React, {useEffect, useState} from 'react';
import {Text, Image, StyleSheet, TouchableOpacity, useColorScheme, Dimensions} from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import AppLoadingComponent from '../components/AppLoadingComponent';
import {useRootNavigationState, useRouter, useSegments} from 'expo-router';
import 'react-native-gesture-handler';
import Cookies from 'universal-cookie'; // Import cookies library
import * as Notifications from 'expo-notifications';

const { width: screenWidth } = Dimensions.get('window');

const Index: React.FC = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const segments = useSegments();
    const navigationState = useRootNavigationState();
    const [isLoading, setIsLoading] = useState(true);

    // Define colors for light and dark themes
    const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
    const cookies = new Cookies();

    useEffect(() => {
        const requestNotificationPermissions = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('No notification permissions!');
            }
        };

        requestNotificationPermissions();
    }, []);

    useEffect(() => {
        if (!navigationState?.key) return;
        checkAuthStatus();
    }, [navigationState?.key]);

    const checkAuthStatus = () => {
        try {
            const userCookie = cookies.get('user');
            console.log('User cookie:', userCookie);
            if (userCookie) {
                console.log('User cookie exists');
                // If user cookie exists, redirect to homepage
                if (segments[0] !== 'home') {
                    router.push('/home/homePage');
                    return
                }

            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }finally {
            setIsLoading(false);
        }
    };


    return (
        <AppLoadingComponent>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
                headerImage={
                    <Image
                        source={require('@/assets/images/keep_image.png')}
                        style={styles.brentLogo}
                    />
                }
                headerHeight={530}
            >
                <ThemedView style={styles.titleContainer}>
                    <Text style={[styles.welcomeText, { color: textColor }]}>
                        Capture anything
                    </Text>
                </ThemedView>
                <ThemedView style={styles.expText}>
                    <Text style={[styles.label, { color: textColor }]}>
                        Make lists, take photos, speak your mind -
                    </Text>
                    <Text style={[styles.label, { color: textColor }]}>
                        whatever works for you, works in keep.
                    </Text>
                </ThemedView>

                {/* Get Started button will only show if there's no user cookie */}
                <TouchableOpacity
                    style={styles.getStartButton}
                    onPress={() => router.push('/GoogleSignIn')}
                >
                    <Text style={styles.signUp}>Get Started</Text>
                </TouchableOpacity>

            </ParallaxScrollView>
        </AppLoadingComponent>
    );
};

const styles = StyleSheet.create({
    brentLogo: {
        height: 200,
        width: 200,
        margin: 15,
        borderRadius: 10,
        position: 'relative',
        top: 160,
        alignSelf: 'center',
    },
    welcomeText: {
        fontSize: 35,
        fontWeight: 'bold',
    },
    titleContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
    },
    expText: {
        flexDirection: 'column',
        gap: 1,
        alignSelf: 'center',
    },
    label: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    signUp: {
        color: 'white',
    },
    getStartButton: {
        backgroundColor: '#2a57eb',
        paddingVertical: 13,
        borderRadius: 20,
        marginTop: 20,
        paddingHorizontal: 25,
        alignSelf: 'center',
    },
});

export default Index;
