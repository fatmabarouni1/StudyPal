import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { NotesPanel } from '@/app/components/notes-panel';
import { PageHeader } from '@/app/components/page-header';
import { SearchInput } from '@/app/components/search-input';
import { PrimaryButton } from '@/app/components/button-kit';

interface NotesPageProps {
  authToken: string;
  onBack: () => void;
}

export function NotesPage({ authToken, onBack }: NotesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [createSignal, setCreateSignal] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <PageHeader
          title="Notebook"
          subtitle="Quick ideas, drafts, and study thoughts"
          actions={
            <>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search notebook..."
                className="md:w-64"
              />
              <PrimaryButton onClick={() => setCreateSignal((prev) => prev + 1)} className="md:self-stretch">
                New Note
              </PrimaryButton>
            </>
          }
        />

        <div className="min-h-[60vh]">
          <NotesPanel authToken={authToken} searchTerm={searchTerm} createSignal={createSignal} />
        </div>
      </main>
    </div>
  );
}
