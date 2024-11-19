import React, {useState} from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import {ThemedView} from "@/components/ThemedView";
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
import {useRouter} from "expo-router";
import {storage,auth} from '@/firebaseConfig';
import Cookies from 'universal-cookie'; // Import cookies library
import firebase from "firebase/compat";
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import {saveNote} from "@/services/NoteService";
import * as Notifications from 'expo-notifications';

const COLORS = [
    '#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90',
    '#a7ffeb', '#cbf0f8', '#d7aefb', '#fdcfe8',
];

const NoteCreationScreen: React.FC = () => {
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showReminder, setShowReminder] = useState(false);
    const [reminderDate, setReminderDate] = useState<Date | null>(null);
    const [pinned, setPinned] = useState(false);
    const [showReminderPicker, setShowReminderPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const cookies = new Cookies();

    interface UserInfo {
        picture: string;
        name: string;
        email: string;
    }

    // // Function to upload a single image to Firebase Storage
    // const uploadImageToFirebase = async (uri: string): Promise<string> => {
    //     try {
    //         const response = await fetch(uri);
    //         const blob = await response.blob();
    //
    //         if (!auth.currentUser?.uid) {
    //             throw new Error('User id not available');
    //         }
    //
    //         const filename = `users/${auth.currentUser.uid}/notes/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    //         const storageRef = ref(storage, filename);
    //
    //         // Upload to Firebase Storage
    //         await uploadBytes(storageRef, blob);
    //
    //         // Get download URL
    //         return await getDownloadURL(storageRef);
    //     } catch (error) {
    //         console.error('Error uploading image:', error);
    //         throw error;
    //     }
    // };

    Notifications.setNotificationHandler({
        async handleNotification() {
            return {
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            };
        },
    });

// In handleSave method
    const scheduleNotification = async (reminderDate: Date, noteTitle: string) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Reminder",
                body: `Note: ${noteTitle}`,
                sound: true,
            },
            trigger: reminderDate,
        });
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title for your note');
            return;
        }

        if (!auth.currentUser) {
            Alert.alert('Error', 'Please sign in to save notes');
            return;
        }

        setIsLoading(true);
        try {
            // // Upload all images to Firebase Storage
            // const uploadPromises = images.map(uri => uploadImageToFirebase(uri));
            // const imageUrls = await Promise.all(uploadPromises);

            // Convert images to base64 for MongoDB storage
            const imagePromises = images.map(async (uri) => {
                const response = await fetch(uri);
                const blob = await response.blob();
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            });

            const base64Images = await Promise.all(imagePromises);


            if (reminderDate) {
                await scheduleNotification(reminderDate, title);
            }

            // Prepare note data
            const noteData = {
                userId: auth.currentUser.uid,
                title,
                content: note,
                backgroundColor,
                images: base64Images,
                reminder: reminderDate,
                pinned,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Save note data to MongoDB
           const save= await saveNote(noteData);

            // Redirect to home page
            if(save.status===201){
                router.push('/home/homePage')
            }


        } catch (error) {
            console.error('Error saving note:', error);
            Alert.alert(
                'Error',
                'Failed to save note. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled) {
                const newImages = result.assets.map(asset => asset.uri);
                setImages([...images, ...newImages]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            alert('Error picking image');
        }
    };

    const handleReminderChange = (event: any, selectedDate?: Date) => {
        const isWeb = Platform.OS === 'web';

        if (isWeb) {
            // Use a different method for web
            const webDate = new Date(event.target.value);
            setReminderDate(webDate);
            setShowReminder(true);
        } else {
            // Existing mobile logic
            setShowReminderPicker(false);
            if (selectedDate) {
                setReminderDate(selectedDate);
                setShowReminder(true);
            }
        }
    };

    const removeReminder = () => {
        setReminderDate(null);
        setShowReminder(false);
        // Here you would typically cancel the reminder notification
    };

    const formatReminderDate = (date: Date) => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === now.toDateString()) {
            return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const ReminderBadge = () => (
        showReminder && reminderDate ? (
            <View style={styles.reminderBadge}>
                <Icon name="access-time" size={16} color="#666" />
                <Text style={styles.reminderText}>
                    {formatReminderDate(reminderDate)}
                </Text>
                <TouchableOpacity
                    onPress={removeReminder}
                    style={styles.removeReminderButton}
                >
                    <Icon name="close" size={16} color="#666" />
                </TouchableOpacity>
            </View>
        ) : null
    );

    const ColorPicker = () => (
        <Modal
            transparent
            visible={showColorPicker}
            onRequestClose={() => setShowColorPicker(false)}
            animationType="fade"
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                onPress={() => setShowColorPicker(false)}
            >
                <View style={styles.colorPickerContainer}>
                    {COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[styles.colorOption, { backgroundColor: color }]}
                            onPress={() => {
                                setBackgroundColor(color);
                                setShowColorPicker(false);
                            }}
                        >
                            {color === backgroundColor && (
                                <Icon name="check" size={20} color="#666" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    // @ts-ignore
    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton}
                        onPress={()=> router.push('/home/homePage')}
                    >
                        <Icon name="arrow-back" size={24} color="#666" />
                    </TouchableOpacity>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerButton}
                            onPress={() => setPinned(!pinned)}
                        >
                            <Icon name="push-pin" size={24} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setShowReminderPicker(true)}
                        >
                            <Icon
                                name="notifications"
                                size={24}
                                color={showReminder ? "#4285f4" : "#666"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton}>
                            <Icon name="archive" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.noteContent}>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#666"
                        />

                        <ReminderBadge />

                        {images.length > 0 && (
                            <View style={styles.imagesSection}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.imageScrollContainer}
                                >
                                    {images.map((uri, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <Image source={{ uri }} style={styles.image} />
                                            <TouchableOpacity
                                                style={styles.removeImage}
                                                onPress={() => {
                                                    const newImages = [...images];
                                                    newImages.splice(index, 1);
                                                    setImages(newImages);
                                                }}
                                            >
                                                <Icon name="close" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <TextInput
                            style={styles.noteInput}
                            placeholder="Note"
                            value={note}
                            onChangeText={setNote}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor="#666"
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <View style={styles.toolbarLeft}>
                        <TouchableOpacity
                            style={styles.toolbarButton}
                            onPress={pickImage}
                        >
                            <Icon name="add-box" size={24} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.toolbarButton}
                            onPress={() => setShowColorPicker(true)}
                        >
                            <Icon name="palette" size={24} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolbarButton}>
                            <Icon name="text-format" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerRight}>
                        <TouchableOpacity style={styles.toolbarButton}>
                            <Icon name="more-vert" size={24} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            <ColorPicker />

            {showReminderPicker && (
                <DateTimePicker
                    value={reminderDate || new Date()}
                    mode="datetime"
                    display="default"
                    onChange={handleReminderChange}
                />
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({

    reminderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f4',
        padding: 8,
        borderRadius: 16,
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    reminderText: {
        marginLeft: 4,
        marginRight: 8,
        color: '#666',
        fontSize: 14,
    },
    removeReminderButton: {
        padding: 2,
    },
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    header: {
        marginTop: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerButton: {
        padding: 8,
    },
    headerActions: {
        flexDirection: 'row',
    },
    content: {
        flex: 1,
    },
    noteContent: {
        padding: 16,
    },
    titleInput: {
        fontSize: 22,
        fontWeight: '500',
        marginBottom: 16,
        color: '#000',
    },
    imagesSection: {
        marginBottom: 16,
    },
    imageScrollContainer: {
        paddingRight: 8, // Account for the last image's margin
    },
    noteInput: {
        fontSize: 16,
        color: '#000',
        minHeight: 200,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    toolbarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toolbarButton: {
        padding: 8,
        marginRight: 8,
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#4285f4',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 8,
    },
    saveButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 14,
    },
    editedButton: {
        padding: 8,
    },
    imageWrapper: {
        marginRight: 8,
        position: 'relative',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 8,
    },
    removeImage: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorPickerContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '80%',
        justifyContent: 'center',
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
});

export default NoteCreationScreen;
