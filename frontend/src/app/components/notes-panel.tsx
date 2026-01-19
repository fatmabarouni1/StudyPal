import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Welcome!',
      content: 'Use this space to jot down ideas, tasks, or anything you need to remember during your study session.',
      timestamp: Date.now(),
    },
  ]);
  const [selectedNote, setSelectedNote] = useState<string | null>('1');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  const currentNote = notes.find((n) => n.id === selectedNote);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      timestamp: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote.id);
    setEditingTitle(newNote.title);
    setEditingContent(newNote.content);
  };

  const deleteNote = (id: string) => {
    const newNotes = notes.filter((n) => n.id !== id);
    setNotes(newNotes);
    if (selectedNote === id) {
      setSelectedNote(newNotes[0]?.id || null);
    }
  };

  const saveNote = () => {
    if (!selectedNote) return;
    
    setNotes(notes.map((n) =>
      n.id === selectedNote
        ? { ...n, title: editingTitle, content: editingContent, timestamp: Date.now() }
        : n
    ));
  };

  // Update editing state when selecting a different note
  const selectNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setSelectedNote(id);
      setEditingTitle(note.title);
      setEditingContent(note.content);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3>Notes</h3>
        <Button onClick={createNewNote} size="sm" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Notes list */}
        <div className="w-48 border-r border-border">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedNote === note.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="font-medium truncate text-sm mb-1">
                    {note.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(note.timestamp)}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Note editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {currentNote ? (
            <>
              <div className="p-4 space-y-3 flex-1 flex flex-col min-h-0">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Note title"
                  className="border-0 px-0 text-lg focus-visible:ring-0"
                />
                <Textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  placeholder="Start typing your notes..."
                  className="flex-1 resize-none border-0 px-0 focus-visible:ring-0 min-h-0"
                />
              </div>
              <div className="p-4 border-t border-border flex items-center justify-between">
                <Button
                  onClick={() => deleteNote(currentNote.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={saveNote} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Create a note to get started</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
