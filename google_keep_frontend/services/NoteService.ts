const baseUrl = 'http://localhost:5000/api/v1/note';


interface NoteData {
    userId: string;
    title: string;
    content: string;
    backgroundColor: string;
    pinned: boolean;
    images: string[];
    reminder: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

function saveNote(noteData: NoteData) {
    return fetch(`${baseUrl}/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            noteData
           // Replace or handle securely
        }),
    });
}

export { saveNote };

