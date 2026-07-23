import { 
  Dna, 
  Scale, 
  TrendingUp, 
  BookOpen, 
  Code2,
  type LucideIcon 
} from 'lucide-react';

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  status: 'active' | 'coming-soon';
  capabilities: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
}

export const agents: AgentInfo[] = [
  {
    id: 'biomedical',
    name: 'Biomedical Agent',
    description: 'Advanced biomedical research and analysis. Explore drug interactions, genomic data, and clinical trial insights with AI-powered precision.',
    icon: Dna,
    color: '#4EDEA3',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    status: 'coming-soon',
    capabilities: [
      'Drug interaction analysis',
      'Genomic sequence analysis',
      'Clinical trial research',
      'Medical literature review',
      'Biomarker discovery',
    ],
    metrics: [
      { label: 'Databases', value: '50+' },
      { label: 'Accuracy', value: '94%' },
    ],
  },
  {
    id: 'legal',
    name: 'Legal Agent',
    description: 'Comprehensive legal research and document analysis. Navigate case law, statutes, and regulations with intelligent assistance.',
    icon: Scale,
    color: '#C084FC',
    gradient: 'from-purple-500/20 to-purple-500/5',
    status: 'coming-soon',
    capabilities: [
      'Case law research',
      'Contract analysis',
      'Statutory interpretation',
      'Compliance checking',
      'Legal document drafting',
    ],
    metrics: [
      { label: 'Jurisdictions', value: '30+' },
      { label: 'Cases', value: '2M+' },
    ],
  },
  {
    id: 'market-research',
    name: 'Market Research Agent',
    description: 'Deep market intelligence and competitive analysis. Uncover trends, analyze markets, and generate strategic insights.',
    icon: TrendingUp,
    color: '#FBBF24',
    gradient: 'from-amber-500/20 to-amber-500/5',
    status: 'coming-soon',
    capabilities: [
      'Market trend analysis',
      'Competitor intelligence',
      'Consumer sentiment analysis',
      'Market sizing & forecasting',
      'SWOT analysis',
    ],
    metrics: [
      { label: 'Markets', value: '100+' },
      { label: 'Data Points', value: '10B+' },
    ],
  },
  {
    id: 'academic-research',
    name: 'Academic Research Agent',
    description: 'Scholarly research and academic paper analysis. Access millions of papers, journals, and conference proceedings.',
    icon: BookOpen,
    color: '#60A5FA',
    gradient: 'from-blue-500/20 to-blue-500/5',
    status: 'coming-soon',
    capabilities: [
      'Paper discovery & review',
      'Citation analysis',
      'Research gap identification',
      'Methodology validation',
      'Literature synthesis',
    ],
    metrics: [
      { label: 'Papers', value: '200M+' },
      { label: 'Journals', value: '50K+' },
    ],
  },
  {
    id: 'programming',
    name: 'Programming Agent',
    description: 'Expert software development assistant. Debug, optimize, and generate code across all major languages and frameworks.',
    icon: Code2,
    color: '#4CD7F6',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    status: 'active',
    capabilities: [
      'Code generation & review',
      'Debugging & optimization',
      'Architecture design',
      'Security analysis',
      'Performance profiling',
    ],
    metrics: [
      { label: 'Languages', value: '50+' },
      { label: 'Response Time', value: '<2s' },
    ],
  },
];