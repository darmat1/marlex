export type ExecutionMode = 'local_cli' | 'byok';
export type CLIAgent = 'claude_code' | 'chatgpt' | 'gemini_cli' | 'ollama' | 'opencode';
export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'local_bridge';

export interface LLMConfig {
  mode: ExecutionMode;
  cliAgent: CLIAgent;
  cliModel: string;
  provider: LLMProvider;
  model: string;
  openaiKey?: string;
  anthropicKey?: string;
  geminiKey?: string;
  localBridgeUrl?: string;
}

export type ProjectMemberRole = 'owner' | 'editor' | 'designer' | 'viewer';

export interface ProjectMember {
  id: string;
  email: string;
  name: string;
  role: ProjectMemberRole;
  avatar?: string;
  status: 'active' | 'pending';
}

export interface MarlexProject {
  id: string;
  name: string;
  brandHandle: string;
  authorName: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  font: string;
  photoOpacity: number;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  instagramHandle: string;
  telegramChannel: string;
  linkedInUrl: string;
  threadsHandle: string;
  defaultBgColor: string;
  defaultAccentColor: string;
  defaultTextColor: string;
  defaultFont: string;
  photoOpacity: number;
}

export type CanvasElementType = 'text' | 'image' | 'shape' | 'badge' | 'arrow' | 'ornament' | 'vignette' | 'header' | 'footer';

export type ShapeType = 
  | 'rectangle' 
  | 'pill' 
  | 'line' 
  | 'badge' 
  | 'circle' 
  | 'glass_card' 
  | 'quote_box' 
  | 'divider' 
  | 'sparkle' 
  | 'corner_decor' 
  | 'glow_orb' 
  | 'vignette_bottom' 
  | 'vignette_top';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  color?: string;
  bgColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  accentWords?: string[];
  shapeType?: ShapeType;
  imageUrl?: string;
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backdropBlur?: boolean;
  zIndex?: number;
  rotation?: number;
  iconName?: string;
}

export type TextPositionMode = 'top' | 'center' | 'bottom';
export type OverlayGradientMode = 'dark_bottom' | 'dark_full' | 'subtle' | 'none';

export interface SlideItem {
  id: string;
  slideNumber: number;
  type: 'cover' | 'content' | 'final';
  headline: string;
  subheadline?: string;
  bodyParagraphs?: string[];
  accentWords?: string[];
  showArrow?: boolean;
  slideBgColor?: string;
  slideAccentColor?: string;
  coverStyle?: 'hero_gradient' | 'minimal';
  photoUrl?: string | null;
  photoOpacity?: number;
  photoFit?: 'cover' | 'contain' | 'top' | 'bottom';
  overlayGradient?: OverlayGradientMode;
  textPosition?: TextPositionMode;
  elements?: CanvasElement[];
}

export interface GenerationResult {
  id: string;
  title: string;
  rawInput: string;
  slides: SlideItem[];
  telegramPost?: string;
  linkedInPost?: string;
  threadsPosts?: string[];
  clientProfileId?: string;
  createdAt: string;
  updatedAt: string;
}
