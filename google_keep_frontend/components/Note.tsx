import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface NoteCardProps {
    note: {
        id: string;
        title: string;
        content: string;
        images?: string[];
        pinned?: boolean;
        backgroundColor: string;
    };
    onPress: (note: any) => void;
}

const Note: React.FC<NoteCardProps> = ({ note, onPress }) => {
    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: note.backgroundColor }]} onPress={() => onPress(note)}>
            {/* Images Row */}
            {note.images && note.images.length > 0 && (
                <View style={styles.imageRow}>
                    {note.images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ))}
                </View>
            )}
            {/* Title and Content */}
            <View style={styles.content}>
                <Text style={styles.title}>{note.title}</Text>
                <Text style={styles.text}>{note.content}</Text>
            </View>
            {/* Pinned Icon */}
            {note.pinned && (
                <Icon name="push-pin" size={24} color="#666" style={styles.pinIcon} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginVertical: 8,
        backgroundColor: '#ffffff',
    },
    imageRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    image: {
        flex: 1,
        height: 100, // Adjust height as needed
        marginRight: 4, // Space between images
        borderRadius: 8,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    text: {
        fontSize: 14,
        color: '#666',
    },
    pinIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default Note;
