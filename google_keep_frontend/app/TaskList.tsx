import React, { useState } from 'react';
import  Icon  from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet, View, TextInput, TouchableOpacity, FlatList, Text } from 'react-native';
import {saveTaskList}  from "@/services/TaskListService";
import {useRouter} from "expo-router";
import {auth} from "@/firebaseConfig";

interface Task {
    id: number;
    text: string;
    completed: boolean;
}
const TaskList = () => {
    const [tasks, setTasks] = useState([] as Task[]);
    const [newTask, setNewTask] = useState('');
    const [title, setTitle] = useState('');

    const router = useRouter();

    const handleAddTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
            setNewTask('');
        }
    };

    const handleTaskCompletion = (id: number) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const handleRemoveTask = (id: number) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    const handleSaveChanges = async () => {
        try {
            if (auth.currentUser) {
                console.log('User:', auth.currentUser.uid);

                const userId = auth.currentUser.uid;
                const task = {
                    title,
                    tasks,
                    userId,
                };

                const response = await saveTaskList(task);

                console.log('Response:', response);
                if (response) {
                    console.log('Task list saved successfully');
                    router.push('/home/homePage');
                }


            }




        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title"
                    placeholderTextColor="#666"
                />
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Icon name="push-pin" size={24} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Icon name="notifications" size={24} color="#4285f4" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Icon name="archive" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newTask}
                        onChangeText={setNewTask}
                        placeholder="List item"
                        placeholderTextColor="#666"
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={tasks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.taskContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.checkboxContainer,
                                    item.completed ? styles.checked : null,
                                ]}
                                onPress={() => handleTaskCompletion(item.id)}
                            >
                                {item.completed && <Icon name="check" size={20} color="#4285f4" />}
                            </TouchableOpacity>
                            <Text style={[styles.taskText, item.completed ? styles.completed : null]}>
                                {item.text}
                            </Text>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveTask(item.id)}
                            >
                                <Icon name="close" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={handleSaveChanges}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    titleInput: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
        flex: 1,
        marginRight: 12,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerButton: {
        marginLeft: 12,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    addButton: {
        backgroundColor: '#4285f4',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checked: {
        backgroundColor: '#4285f4',
        borderColor: '#4285f4',
    },
    taskText: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    completed: {
        textDecorationLine: 'line-through',
        color: '#666',
    },
    removeButton: {
        padding: 4,
        marginLeft: 12,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    saveButtonText: {
        color: '#4285f4',
        fontWeight: '500',
        fontSize: 16,
    },
});

export default TaskList;
