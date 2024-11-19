import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TaskListProps {

    taskList: {
        id: string;
        title: string;
        tasks: { id: string; text: string; completed: boolean }[];
        pinned?: boolean;
        backgroundColor: string;
    };
    onPress: (taskList: any) => void;
}

const TaskListCard: React.FC<TaskListProps> = ({ taskList, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: taskList.backgroundColor }]}
            onPress={() => onPress(taskList)}
        >
            <View style={styles.content}>
                <Text style={styles.title}>{taskList.title}</Text>
                {taskList.tasks.slice(0, 3).map((task, index) => (
                    <View key={task.id} style={styles.taskRow}>
                        <Icon
                            name={task.completed ? "check-box" : "check-box-outline-blank"}
                            size={20}
                            color={task.completed ? "#4CAF50" : "#666"}
                        />
                        <Text
                            style={[
                                styles.taskText,
                                task.completed && styles.completedTask
                            ]}
                        >
                            {task.text}
                        </Text>
                    </View>
                ))}
                {taskList.tasks.length > 3 && (
                    <Text style={styles.moreTasksText}>
                        +{taskList.tasks.length - 3} more tasks
                    </Text>
                )}
            </View>
            {taskList.pinned && (
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
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    taskText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    completedTask: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    moreTasksText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        fontStyle: 'italic',
    },
    pinIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default TaskListCard;
