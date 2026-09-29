export type ToolStatus = 'live' | 'planned';

export type ToolDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ToolTier = 'Tier 1: Pure Logic' | 'Tier 2: Light Audio' | 'Tier 3: Real DSP';

export interface Tool {
  id: string;
  number: number;
  name: string;
  description: string;
  status: ToolStatus;
  tier: ToolTier;
  difficulty: ToolDifficulty;
  category: string;
  tags: string[];
  route: string;
  timeToMvp: string;
}

export interface DecisionNode {
  id: string;
  title: string;
  question: string;
  measurementGuide?: string;
  options: {
    label: string;
    description?: string;
    nextNodeId?: string;
    diagnosisId?: string;
  }[];
}

export interface Diagnosis {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'luthier';
  confidence: 'High' | 'Medium' | 'Check First';
  rankedCauses: string[];
  fixOrder: string[];
  measurementsRequired: string[];
  whenToConsultLuthier: string;
}

export interface SymptomTree {
  id: string;
  symptomName: string;
  catalogNumber: number;
  shortDescription: string;
  startNodeId: string;
  nodes: Record<string, DecisionNode>;
  diagnoses: Record<string, Diagnosis>;
}
