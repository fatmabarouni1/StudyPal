import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Link2, Save, Trash2, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  fetchModule,
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  fetchNote,
  saveNote,
  fetchLinks,
  createLink,
  deleteLink,
  fetchModuleResources,
  generateModuleResources,
  type RevisionModule,
  type ModuleDocument,
  type ModuleNote,
  type ModuleLink,
  type ModuleResourceSuggestion,
} from '@/app/api/revision';
import { BaseCard } from '@/app/components/base-card';
import { Pill } from '@/app/components/pill';
import { PrimaryButton, SecondaryButton } from '@/app/components/button-kit';

interface ModulePageProps {
  authToken: string;
  moduleId: string;
  onBack: () => void;
}

export function ModulePage({ authToken, moduleId, onBack }: ModulePageProps) {
  const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const [module, setModule] = useState<RevisionModule | null>(null);
  const [documents, setDocuments] = useState<ModuleDocument[]>([]);
  const [note, setNote] = useState<ModuleNote | null>(null);
  const [links, setLinks] = useState<ModuleLink[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<ModuleResourceSuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    loadModule();
  }, [authToken, moduleId]);

  const loadModule = async () => {
    if (!authToken || !moduleId) return;
    setLoading(true);
    setError('');
    try {
      const [moduleData, docs, noteData, linksData] = await Promise.all([
        fetchModule(authToken, moduleId),
        fetchDocuments(authToken, moduleId),
        fetchNote(authToken, moduleId),
        fetchLinks(authToken, moduleId),
      ]);
      const suggestion = await fetchModuleResources(authToken, moduleId);
      setModule(moduleData);
      setDocuments(docs);
      setNote(noteData);
      setNoteContent(noteData?.content ?? '');
      setLinks(linksData);
      setAiSuggestion(suggestion);
    } catch (err: any) {
      setError(err.message || 'Failed to load module.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!authToken || !event.target.files?.[0]) return;
    setError('');
    try {
      const uploaded = await uploadDocument(authToken, moduleId, event.target.files[0]);
      setDocuments((prev) => [uploaded, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!authToken) return;
    setError('');
    try {
      await deleteDocument(authToken, documentId);
      setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete document.');
    }
  };

  const handleSaveNote = async () => {
    if (!authToken) return;
    setSavingNote(true);
    setError('');
    try {
      const saved = await saveNote(authToken, moduleId, noteContent);
      setNote(saved);
    } catch (err: any) {
      setError(err.message || 'Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authToken) return;
    setError('');
    try {
      const created = await createLink(authToken, moduleId, {
        title: linkTitle,
        url: linkUrl,
      });
      setLinks((prev) => [created, ...prev]);
      setLinkTitle('');
      setLinkUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to add link.');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!authToken) return;
    setError('');
    try {
      await deleteLink(authToken, linkId);
      setLinks((prev) => prev.filter((link) => link._id !== linkId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete link.');
    }
  };

  const handleGenerateResources = async () => {
    if (!authToken) return;
    setAiLoading(true);
    setAiError('');
    try {
      const suggestion = await generateModuleResources(authToken, moduleId, 'en');
      setAiSuggestion(suggestion);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI resources.');
    } finally {
      setAiLoading(false);
    }
  };

  const getFileUrl = (url: string) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return apiBaseUrl ? `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}` : url;
  };

  const moduleMeta = useMemo(() => {
    const docCount = documents.length;
    const linkCount = links.length;
    return `${docCount} docs • ${linkCount} links`;
  }, [documents.length, links.length]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Modules
        </Button>
      </div>

      {loading ? (
        <BaseCard className="p-6 text-sm text-muted-foreground">Loading module...</BaseCard>
      ) : module ? (
        <BaseCard className="p-6">
          <h1 className="text-3xl font-semibold">{module.title}</h1>
          {module.description ? (
            <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
          ) : null}
          <div className="mt-3 text-xs text-muted-foreground">{moduleMeta}</div>
        </BaseCard>
      ) : null}

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BaseCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <h3 className="text-base font-semibold">Documents</h3>
              </div>
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
                <input type="file" className="hidden" onChange={handleDocumentUpload} />
              </label>
            </div>

            {documents.length === 0 ? (
              <div className="text-sm text-muted-foreground">No documents yet.</div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{doc.originalName ?? doc.original_name}</div>
                      <div className="text-xs text-muted-foreground">{doc.mime_type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SecondaryButton asChild size="sm">
                        <a href={getFileUrl(doc.url)} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </SecondaryButton>
                      <SecondaryButton variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc._id)}>
                        <Trash2 className="h-4 w-4" />
                      </SecondaryButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BaseCard>

          <BaseCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <h3 className="text-base font-semibold">Notes & Summaries</h3>
              </div>
              <SecondaryButton size="sm" onClick={handleSaveNote} disabled={savingNote}>
                {savingNote ? 'Saving...' : 'Save'}
              </SecondaryButton>
            </div>
            <Textarea
              rows={10}
              placeholder="Write your notes, summaries, and key ideas here..."
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              className="min-h-[220px]"
            />
            {note?.updated_at ? (
              <div className="mt-2 text-xs text-muted-foreground">
                Last saved {new Date(note.updated_at).toLocaleString()}
              </div>
            ) : null}
          </BaseCard>
        </div>

        <div className="space-y-6">
          <BaseCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="h-4 w-4" />
              <h3 className="text-base font-semibold">Useful Links</h3>
            </div>
            <form onSubmit={handleAddLink} className="space-y-3">
              <Input
                placeholder="Link title"
                value={linkTitle}
                onChange={(event) => setLinkTitle(event.target.value)}
                required
              />
              <Input
                placeholder="https://"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                required
              />
              <PrimaryButton type="submit" className="w-full">Add Link</PrimaryButton>
            </form>

            {links.length === 0 ? (
              <div className="mt-4 text-sm text-muted-foreground">No links yet.</div>
            ) : (
              <div className="mt-4 space-y-2">
                {links.map((link) => (
                  <div
                    key={link._id}
                    className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{link.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SecondaryButton
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank', 'noreferrer')}
                      >
                        Open
                      </SecondaryButton>
                      <SecondaryButton variant="ghost" size="icon" onClick={() => handleDeleteLink(link._id)}>
                        <Trash2 className="h-4 w-4" />
                      </SecondaryButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BaseCard>

          <BaseCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <h3 className="text-base font-semibold">AI Resources</h3>
              </div>
              <SecondaryButton size="sm" onClick={handleGenerateResources} disabled={aiLoading}>
                {aiLoading ? 'Generating...' : 'Generate Resources'}
              </SecondaryButton>
            </div>

            {aiError && <div className="text-sm text-destructive mb-3">{aiError}</div>}

            {!aiSuggestion ? (
              <div className="text-sm text-muted-foreground">
                No AI resources yet. Generate recommendations to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {aiSuggestion.outputJson?.studyAdvice ? (
                  <div className="text-sm text-muted-foreground">
                    {aiSuggestion.outputJson.studyAdvice}
                  </div>
                ) : null}

                {aiSuggestion.outputJson?.recommendedResources?.length ? (
                  <div className="space-y-2">
                    {aiSuggestion.outputJson.recommendedResources.map((resource, index) => (
                      <div
                        key={`${resource.title}-${index}`}
                        className="rounded-xl border border-border/70 px-3 py-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 space-y-2">
                            <div className="text-sm font-medium">{resource.title}</div>
                            <div className="flex flex-wrap gap-2">
                              <Pill className="bg-muted text-muted-foreground">{resource.platform}</Pill>
                              <Pill className="bg-muted text-muted-foreground">{resource.type}</Pill>
                              <Pill className="bg-muted text-muted-foreground">{resource.difficulty}</Pill>
                              <Pill className="bg-muted text-muted-foreground">{resource.estimatedTime}</Pill>
                            </div>
                          </div>
                          <SecondaryButton
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(resource.url, '_blank', 'noreferrer')}
                          >
                            Open
                          </SecondaryButton>
                        </div>
                        {resource.whyThisHelps ? (
                          <div className="mt-2 text-xs text-muted-foreground">{resource.whyThisHelps}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No recommendations returned.</div>
                )}
              </div>
            )}
          </BaseCard>
        </div>
      </div>
    </div>
  );
}
