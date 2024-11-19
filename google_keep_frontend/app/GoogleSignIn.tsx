// GoogleSignIn.tsx
import { useEffect, useState } from 'react';
import {Button, Text, TouchableOpacity, View, StyleSheet, Image} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import {router} from "expo-router";
import Cookies from 'universal-cookie'; // Import cookies library
import {signUp} from '@/services/AuthService';
import React from 'react';


// Register your web client in Google Cloud Console and get the client ID
const webClientId = '699578720864-3vtt19qkoi43sdpgjta2oq27lakflvkh.apps.googleusercontent.com';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignIn() {
    const [userInfo, setUserInfo] = useState<null | any>(null);
    const [error, setError] = useState<string | null>(null);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "699578720864-5tt73bqtivivo57v7t0t5uj37e3elh45.apps.googleusercontent.com",
        // iosClientId: "699578720864-YYYY.apps.googleusercontent.com",
        webClientId: webClientId,
        scopes: ['profile', 'email', 'openid'],
    });

    const cookies = new Cookies();

    async function handleSignInResponse() {
        if (response?.type === 'success') {
            try {
                const { access_token } = response.params;

                // First, get user info using the access token
                const userInfoResponse = await fetch(
                    'https://www.googleapis.com/userinfo/v2/me',
                    {
                        headers: { Authorization: `Bearer ${access_token}` },
                    }
                );

                const userData = await userInfoResponse.json();

                // Create a custom credential
                const credential = GoogleAuthProvider.credential(
                    null,
                    access_token
                );

                // Sign in to Firebase with the credential
                const result = await signInWithCredential(auth, credential);

                setUserInfo({
                    ...result.user,
                    ...userData
                });
                setError(null);


                // Sign up user in the backend
                const backendResponse = await signUp({
                    name: userData.name,
                    email: userData.email,
                    picture: userData.picture,
                    userId: result.user.uid,
                });


                if (!backendResponse.ok) {
                    console.error('Backend signup error:', backendResponse.statusText);
                    throw new Error('Backend signup failed');
                }

                // Store user info in cookies
                cookies.set('user', JSON.stringify({
                    email: userData.email,
                    name: userData.name,
                    picture: userData.picture,
                }), {
                    path: '/',
                    secure: true,
                    httpOnly: false, // Set to true if running on the server
                    sameSite: 'strict',
                });

                router.push('/home')

            } catch (e) {
                console.error('Sign in error:', e);
                // @ts-ignore
                setError(e.message);
            }
        } else if (response?.type === 'error') {
            console.error('Auth response error:', response.error);
            setError(response.error?.message || 'Authentication failed');
        }
    }

    useEffect(() => {
        handleSignInResponse();
    }, [response]);

    const signIn = async () => {
        try {
            const result = await promptAsync();
            console.log('Prompt result:', result);
        } catch (e) {
            console.error('Prompt error:', e);
            // @ts-ignore
            setError(e.message);
        }
    };

    const signOut = async () => {
        try {
            await auth.signOut();
            setUserInfo(null);
            console.log('Sign out successful');
        } catch (e) {
            console.error('Sign out error:', e);
            // @ts-ignore
            setError(e.message);
        }
    };

    // @ts-ignore
    return (
        <View style={styles.container}>
            {error && (
                <Text style={styles.errorText}>
                    Error: {error}
                </Text>
            )}

            {userInfo ? (
                <View style={styles.profile}>
                    <Image source={{ uri: userInfo.picture }} style={styles.profileImage} />
                    <Text style={styles.profileName}>{userInfo.name}</Text>
                    {/*<Button title="Sign Out" onPress={signOut} />*/}
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.button, !request && styles.buttonDisabled]}
                    onPress={signIn}
                    disabled={!request}
                >
                    <Image
                        source={{
                            uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/150px-Google_%22G%22_logo.svg.png',
                        }}
                        style={styles.logo}
                    />
                    <Text style={styles.buttonText}>Sign in with Google</Text>
                </TouchableOpacity>
            )}
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
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    logo: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    buttonText: {
        color: '#757575',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#D32F2F',
        marginBottom: 20,
        fontSize: 14,
        textAlign: 'center',
    },
    profile: {
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
});
