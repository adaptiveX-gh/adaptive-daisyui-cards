/**
 * ThemeService
 * Manages DaisyUI themes and color palettes
 */

const DAISYUI_THEMES = {
  // Professional/Classic themes
  light: {
    name: 'light',
    colors: {
      primary: '#570df8',
      secondary: '#f000b8',
      accent: '#37cdbe',
      neutral: '#3d4451',
      'base-100': '#ffffff',
      'base-200': '#f9fafb',
      'base-300': '#f3f4f6'
    },
    scale: 'md',
    typography: 'classic'
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#661ae6',
      secondary: '#d926aa',
      accent: '#1fb2a6',
      neutral: '#191d24',
      'base-100': '#2a303c',
      'base-200': '#242933',
      'base-300': '#20252e'
    },
    scale: 'md',
    typography: 'classic'
  },
  corporate: {
    name: 'corporate',
    colors: {
      primary: '#4b6bfb',
      secondary: '#7b92b2',
      accent: '#67cba0',
      neutral: '#181a2a',
      'base-100': '#ffffff',
      'base-200': '#f7f8f9',
      'base-300': '#e5e6e6'
    },
    scale: 'md',
    typography: 'classic'
  },
  business: {
    name: 'business',
    colors: {
      primary: '#1c4e80',
      secondary: '#7c909a',
      accent: '#ea6947',
      neutral: '#23282e',
      'base-100': '#ffffff',
      'base-200': '#f2f2f2',
      'base-300': '#e5e6e6'
    },
    scale: 'md',
    typography: 'classic'
  },

  // Bold/Futuristic themes
  cyberpunk: {
    name: 'cyberpunk',
    colors: {
      primary: '#ff7598',
      secondary: '#75d1f0',
      accent: '#ffed4e',
      neutral: '#16181a',
      'base-100': '#0e1119',
      'base-200': '#1e242e',
      'base-300': '#2a303c'
    },
    scale: 'lg',
    typography: 'bold'
  },
  synthwave: {
    name: 'synthwave',
    colors: {
      primary: '#e779c1',
      secondary: '#58c7f3',
      accent: '#f9ed4e',
      neutral: '#221551',
      'base-100': '#1a103d',
      'base-200': '#24156e',
      'base-300': '#2e1a7c'
    },
    scale: 'lg',
    typography: 'bold'
  },
  dracula: {
    name: 'dracula',
    colors: {
      primary: '#ff79c6',
      secondary: '#bd93f9',
      accent: '#ffb86c',
      neutral: '#414558',
      'base-100': '#282a36',
      'base-200': '#1e2029',
      'base-300': '#16171d'
    },
    scale: 'md',
    typography: 'bold'
  },

  // Soft/Pastel themes
  cupcake: {
    name: 'cupcake',
    colors: {
      primary: '#65c3c8',
      secondary: '#ef9fbc',
      accent: '#eeaf3a',
      neutral: '#291334',
      'base-100': '#faf7f5',
      'base-200': '#efeae6',
      'base-300': '#e7e2df'
    },
    scale: 'sm',
    typography: 'soft'
  },
  pastel: {
    name: 'pastel',
    colors: {
      primary: '#d1c1d7',
      secondary: '#f6cbd1',
      accent: '#b4e9d6',
      neutral: '#70acc7',
      'base-100': '#ffffff',
      'base-200': '#f9fafb',
      'base-300': '#f3f4f6'
    },
    scale: 'sm',
    typography: 'soft'
  },
  valentine: {
    name: 'valentine',
    colors: {
      primary: '#e96d7b',
      secondary: '#a991f7',
      accent: '#88dbdd',
      neutral: '#af4670',
      'base-100': '#fff5f7',
      'base-200': '#fae9ed',
      'base-300': '#f5d9e0'
    },
    scale: 'sm',
    typography: 'soft'
  },

  // Quirky/Retro themes
  retro: {
    name: 'retro',
    colors: {
      primary: '#ef9995',
      secondary: '#a4cbb4',
      accent: '#ebdc99',
      neutral: '#2e282a',
      'base-100': '#ece3ca',
      'base-200': '#e4d8b4',
      'base-300': '#d2c59d'
    },
    scale: 'md',
    typography: 'quirky'
  },
  halloween: {
    name: 'halloween',
    colors: {
      primary: '#f28c18',
      secondary: '#6d3a9c',
      accent: '#51a800',
      neutral: '#1b1d1d',
      'base-100': '#212121',
      'base-200': '#1a1a1a',
      'base-300': '#141414'
    },
    scale: 'md',
    typography: 'quirky'
  },
  forest: {
    name: 'forest',
    colors: {
      primary: '#1eb854',
      secondary: '#1db88e',
      accent: '#1db8ab',
      neutral: '#19362d',
      'base-100': '#171212',
      'base-200': '#0f0a0a',
      'base-300': '#0a0505'
    },
    scale: 'md',
    typography: 'classic'
  }
};

export class ThemeService {
  constructor() {
    this.themes = DAISYUI_THEMES;
    this.defaultTheme = 'light';
  }

  /**
   * Get theme configuration by name
   */
  getTheme(name) {
    const theme = this.themes[name] || this.themes[this.defaultTheme];
    return { ...theme };
  }

  /**
   * Get all available themes
   */
  getAllThemes() {
    return Object.keys(this.themes);
  }

  /**
   * Get theme by style/mood
   */
  getThemeByStyle(style) {
    const styleMap = {
      professional: ['corporate', 'business', 'light', 'dark'],
      playful: ['cupcake', 'pastel', 'valentine', 'retro'],
      minimal: ['light', 'corporate', 'business'],
      bold: ['cyberpunk', 'synthwave', 'dracula'],
      dark: ['dark', 'forest', 'halloween', 'dracula'],
      colorful: ['synthwave', 'cyberpunk', 'valentine', 'retro']
    };

    const themes = styleMap[style] || styleMap.professional;
    const themeName = themes[0];
    return this.getTheme(themeName);
  }

  /**
   * Validate and normalize theme object
   */
  normalizeTheme(themeInput) {
    if (typeof themeInput === 'string') {
      return this.getTheme(themeInput);
    }

    if (themeInput && themeInput.name) {
      const baseTheme = this.getTheme(themeInput.name);

      // Merge custom colors if provided
      if (themeInput.colors) {
        baseTheme.colors = {
          ...baseTheme.colors,
          ...themeInput.colors
        };
      }

      // Override scale if provided
      if (themeInput.scale) {
        baseTheme.scale = themeInput.scale;
      }

      return baseTheme;
    }

    // Default fallback
    return this.getTheme(this.defaultTheme);
  }

  /**
   * Get CSS custom properties for a theme
   */
  getThemeCSS(themeName) {
    const theme = this.getTheme(themeName);
    const cssVars = Object.entries(theme.colors)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');

    return `[data-theme="${themeName}"] {\n${cssVars}\n}`;
  }

  /**
   * Get typography class for theme
   */
  getTypographyClass(themeName) {
    const theme = this.getTheme(themeName);
    return theme.typography || 'classic';
  }

  /**
   * Get recommended themes by use case
   */
  getRecommendedThemes(useCase) {
    const recommendations = {
      presentation: ['corporate', 'business', 'light', 'dark'],
      marketing: ['synthwave', 'cyberpunk', 'valentine', 'cupcake'],
      documentation: ['light', 'dark', 'corporate'],
      portfolio: ['dracula', 'forest', 'cyberpunk', 'retro'],
      dashboard: ['corporate', 'business', 'dark', 'forest']
    };

    return recommendations[useCase] || recommendations.presentation;
  }
}

export default ThemeService;
