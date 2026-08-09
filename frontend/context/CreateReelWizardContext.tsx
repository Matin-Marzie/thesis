import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { DraftSubtitleLine, WizardVideoAsset } from '../types/createReel';

const makeLocalId = () => `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface CreateReelWizardContextType {
  videoAsset: WizardVideoAsset | null;
  setVideoAsset: (asset: WizardVideoAsset | null) => void;
  lines: DraftSubtitleLine[];
  addLine: (line: Omit<DraftSubtitleLine, 'localId'>) => void;
  updateLine: (localId: string, updates: Partial<Omit<DraftSubtitleLine, 'localId'>>) => void;
  removeLine: (localId: string) => void;
  languageId: number | null;
  setLanguageId: (id: number | null) => void;
  translationLanguageId: number | null;
  setTranslationLanguageId: (id: number | null) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  reset: () => void;
}

const CreateReelWizardContext = createContext<CreateReelWizardContextType | null>(null);

export const CreateReelWizardProvider = ({ children }: { children: React.ReactNode }) => {
  const [videoAsset, setVideoAsset] = useState<WizardVideoAsset | null>(null);
  const [lines, setLines] = useState<DraftSubtitleLine[]>([]);
  const [languageId, setLanguageId] = useState<number | null>(null);
  const [translationLanguageId, setTranslationLanguageId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const addLine = useCallback((line: Omit<DraftSubtitleLine, 'localId'>) => {
    setLines((prev) => [...prev, { ...line, localId: makeLocalId() }]);
  }, []);

  const updateLine = useCallback((localId: string, updates: Partial<Omit<DraftSubtitleLine, 'localId'>>) => {
    setLines((prev) => prev.map((line) => (line.localId === localId ? { ...line, ...updates } : line)));
  }, []);

  const removeLine = useCallback((localId: string) => {
    setLines((prev) => prev.filter((line) => line.localId !== localId));
  }, []);

  const reset = useCallback(() => {
    setVideoAsset(null);
    setLines([]);
    setLanguageId(null);
    setTranslationLanguageId(null);
    setTitle('');
    setDescription('');
  }, []);

  const value = useMemo(
    () => ({
      videoAsset,
      setVideoAsset,
      lines,
      addLine,
      updateLine,
      removeLine,
      languageId,
      setLanguageId,
      translationLanguageId,
      setTranslationLanguageId,
      title,
      setTitle,
      description,
      setDescription,
      reset,
    }),
    [videoAsset, lines, addLine, updateLine, removeLine, languageId, translationLanguageId, title, description, reset]
  );

  return <CreateReelWizardContext.Provider value={value}>{children}</CreateReelWizardContext.Provider>;
};

export const useCreateReelWizard = () => {
  const context = useContext(CreateReelWizardContext);
  if (!context) {
    throw new Error('useCreateReelWizard must be used within a CreateReelWizardProvider');
  }
  return context;
};
