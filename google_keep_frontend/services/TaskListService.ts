const baseUrl    = 'http://localhost:5000/api/v1/task';


// Save task list
async function saveTaskList(taskList: any) {
    try {
        const response = await fetch(`${baseUrl}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskList),
        });

        if (response.ok) {
            const savedList = await response.json();
            return savedList;
        } else {
            throw new Error('Error saving task list');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export { saveTaskList };

