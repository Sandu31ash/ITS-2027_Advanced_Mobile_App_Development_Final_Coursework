import React, { useState, useEffect, useRef } from "react";
import {View, TextInput, StyleSheet, Text, TouchableOpacity, Animated, FlatList} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useLocalSearchParams, useRouter} from 'expo-router';
import NoteCard from '@/components/Note';

import axios from 'axios';
import {auth} from "@/firebaseConfig";
import TaskListCard from "@/components/Task";

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

interface BaseItem {
    id: string;
    title: string;
    backgroundColor: string;
    pinned?: boolean;
    reminder?: Date | null;
    type: 'note' | 'tasklist';
}

interface Note extends BaseItem {
    type: 'note';
    content: string;
    images?: string[];
}

interface TaskList extends BaseItem {
    type: 'tasklist';
    tasks: Task[];
}

type ListItem = Note | TaskList;

const Home: React.FC = () => {
    const [selectedNoteType, setSelectedNoteType] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const optionsAnim = useRef(new Animated.Value(0)).current;
    const rotateAnimation = useRef(new Animated.Value(0)).current;
    const [isLoading, setIsLoading] = useState(true);
    const { searchText } = useLocalSearchParams<{ searchText?: string }>();
    const [notes, setNotes] = useState<Note[]>([]);
    const [taskLists, setTaskLists] = useState<TaskList[]>([]);
    const [pinnedNote, setPinnedNote] = useState<ListItem | null>(null);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [filteredTaskLists, setFilteredTaskLists] = useState<TaskList[]>([]);
    const router = useRouter();

    // Animate options when showOptions changes
    useEffect(() => {
        Animated.parallel([
            Animated.timing(optionsAnim, {
                toValue: showOptions ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(rotateAnimation, {
                toValue: showOptions ? 1 : 0,
                useNativeDriver: true,
                tension: 40,
                friction: 7
            })
        ]).start();
    }, [showOptions]);
    useEffect(() => {
        if (!searchText || searchText.trim() === '') {
            setFilteredNotes(notes.filter(note => !note.pinned));
            setFilteredTaskLists(taskLists.filter(taskList => !taskList.pinned));
        } else {
            const searchLower = searchText.toLowerCase();

            // Filter notes
            const filteredNotes = notes.filter(note =>
                note.title.toLowerCase().includes(searchLower) ||
                note.content.toLowerCase().includes(searchLower)
            );

            // Filter task lists
            const filteredTasks = taskLists.filter(taskList =>
                taskList.title.toLowerCase().includes(searchLower) ||
                taskList.tasks.some(task =>
                    task.text.toLowerCase().includes(searchLower)
                )
            );

            setFilteredNotes(filteredNotes);
            setFilteredTaskLists(filteredTasks);
        }
    }, [searchText, notes, taskLists]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setIsLoading(true);
                if (auth.currentUser) {
                    const response = await axios.get(`http://localhost:5000/api/v1/note/${auth.currentUser.uid}`);
                    const fetchedItems = response.data.data;

                    // Separate notes and task lists
                    const regularNotes = fetchedItems.filter((item: ListItem) =>
                        item.type === 'note'
                    ) as Note[];

                    const taskLists = fetchedItems.filter((item: ListItem) =>
                        item.type === 'tasklist'
                    ) as TaskList[];

                    setNotes(regularNotes);
                    setTaskLists(taskLists);

                    // Set pinned item
                    const pinnedItem = fetchedItems.find((item: ListItem) => item.pinned);
                    setPinnedNote(pinnedItem);
                }
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setIsLoading(false);
            }
        };


        // Add authentication state listener
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchNotes();
            } else {
                setNotes([]);
                setPinnedNote(null);
                setIsLoading(false);
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    const rotation = rotateAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg']
    });

    const handleAddNote = () => {
        setShowOptions(!showOptions);
    };

    const handleSelectNoteType = (type: string) => {

        switch (type) {
            case 'text':
                router.push({
                    pathname: '/NoteCard',
                    params: { type: 'text' }
                });
                break;
            case 'image':

                break;
            case 'drawing':

                break;
            case 'list':
                router.push({
                    pathname: '/TaskList',
                    params: { type: 'text' }
                });
                break;
            default:
                break
        }

        setSelectedNoteType(type);
        setShowOptions(false);
    };
    const handleNotePress = (note: Note) => {
        router.push({
            pathname: '/NoteCard',
            params: {
                noteId: note.id,
                title: note.title,
                content: note.content,
                backgroundColor: note.backgroundColor,
                images: note.images ? JSON.stringify(note.images) : undefined,
                reminder: note.reminder ? note.reminder.toString() : undefined,
            }
        });
    };

    const handleTaskListPress = (taskList: TaskList) => {
        router.push({
            pathname: '/TaskList',
            params: {
                taskListId: taskList.id,
                title: taskList.title,
                tasks: JSON.stringify(taskList.tasks),
                backgroundColor: taskList.backgroundColor
            }
        });
    };
    return (
        <ThemedView style={styles.container}>
            {/* Floating Action Button */}
            {pinnedNote && (
                pinnedNote.type === 'tasklist' ? (
                    <TaskListCard taskList={pinnedNote} onPress={handleTaskListPress} />
                ) : (
                    <NoteCard note={pinnedNote} onPress={handleNotePress} />
                )
            )}
            <FlatList
                data={[...filteredNotes, ...filteredTaskLists] as ListItem[]}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <View style={styles.columnItem}>
                        {item.type === 'tasklist' ? (
                            <TaskListCard taskList={item} onPress={handleTaskListPress} />
                        ) : (
                            <NoteCard note={item} onPress={handleNotePress} />
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {searchText && searchText.trim() !== ''
                                ? 'No items found matching your search'
                                : 'No items yet'}
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity
                onPress={handleAddNote}
                style={[styles.fab, showOptions && styles.fabActive]}
                activeOpacity={0.8}
            >
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <Icon name="add" size={30} color="#fff" />
                </Animated.View>
            </TouchableOpacity>

            {/* Animated Options Menu */}
            <Animated.View
                style={[
                    styles.optionMenu,
                    {
                        opacity: optionsAnim,
                        transform: [
                            {
                                scale: optionsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                            {
                                translateY: optionsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            },
                        ],
                        
                        pointerEvents: showOptions ? 'auto' : 'none'
                    }
                ]}
            >
                <TouchableOpacity
                    onPress={() => handleSelectNoteType('image')}
                    style={styles.optionButton}
                >
                    <Text style={styles.optionText}>Image </Text>
                    <Icon name="image" size={24} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleSelectNoteType('drawing')}
                    style={styles.optionButton}
                >
                    <Text style={styles.optionText}>Drawing</Text>
                    <Icon name="brush" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleSelectNoteType('list')}
                    style={styles.optionButton}
                >
                    <Text style={styles.optionText}>List    </Text>
                    <Icon name="check-box" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() =>
                        handleSelectNoteType('text')
                }
                    style={styles.optionButton}
                >
                    <Text style={styles.optionText}>Text   </Text>
                    <Icon name="text-fields" size={24} color="#000" />
                </TouchableOpacity>
            </Animated.View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    optionText: {
        color: "#000",
        fontSize: 16,
        marginLeft: 10,
    },
    optionMenu: {
        position: "absolute",
        bottom: 100,
        right: 20,
        borderRadius: 10,
        zIndex: 10,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: "#c0e3fc",
        marginBottom: 10,
        borderRadius: 100,
        width: 120,
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 30,
        backgroundColor: "#40608d",
        borderRadius: 20,
        height: 60,
        width: 60,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabActive: {
        backgroundColor: "#40608d",
    },
    row: {
        flex:1,
        justifyContent: 'space-between',
    },
    columnItem: {
        width: '48%', // Slightly less than 50% to add some spacing
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    }
});

export default Home;
