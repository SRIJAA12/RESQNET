/**
 * RESQNET Storm Command Design Tokens
 * Master Specification - Phase 1 Design Foundation
 */

export const designTokens = {
  name: 'Storm Command',
  version: '1.0.0',
  mode: {
    operational: 'dark',
    public: 'light',
  },
  colors: {
    // Surfaces & Canvas (Dark Operational)
    surfaceBase: '#0B1220', // Main canvas & radar floor
    surfaceContainer: '#111C2B', // Standard panels & tables
    surfaceRaised: '#172638', // Raised cards, sidebars & popovers
    surfaceHighlight: '#1F344D', // Card hover & active container
    borderSubtle: '#26394D', // Structural container boundaries
    borderActive: '#36D6C4', // Cyan active border
    borderFocus: 'rgba(54, 214, 196, 0.45)', // Ambient focus glow

    // Signal & Functional Status
    signalCyan: '#36D6C4', // Primary brand action & active telemetry
    criticalCoral: '#FF6268', // Emergency SOS, casualty & lethal hazard
    alertAmber: '#FFB547', // Low supplies, bottlenecks & warnings
    successEmerald: '#65D6A6', // Evacuated, verified, ready units
    infoAzure: '#79B8FF', // Atmospheric sensors & neutral comms

    // Typography & Contrast (Dark Operational)
    textPrimary: '#F4F5F2', // Cloud white (headings & high contrast)
    textSecondary: '#B8C6D4', // Body copy & interface instructions
    textMuted: '#8798AA', // Monospace labels & field captions
    textDisabled: '#4E5F73', // Inactive controls

    // Public Mode Light Theme Tokens
    light: {
      surfaceBase: '#F8FAFC',
      surfaceContainer: '#FFFFFF',
      surfaceRaised: '#F1F5F9',
      borderSubtle: '#CBD5E1',
      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B',
      signalCyan: '#0D9488', // High-contrast teal for bright sunlight
      criticalCoral: '#DC2626',
      alertAmber: '#D97706',
      successEmerald: '#16A34A',
    },
  },

  typography: {
    fonts: {
      display: 'Manrope, system-ui, sans-serif',
      body: 'Inter, system-ui, -apple-system, sans-serif',
      mono: '"IBM Plex Mono", ui-monospace, monospace',
    },
    scales: {
      headlineXl: {
        fontSize: '2.5rem', // 40px
        lineHeight: '1.15',
        fontWeight: '800',
        fontFamily: 'Manrope',
        letterSpacing: '-0.03em',
      },
      headlineLg: {
        fontSize: '1.875rem', // 30px
        lineHeight: '1.2',
        fontWeight: '700',
        fontFamily: 'Manrope',
        letterSpacing: '-0.025em',
      },
      headlineMd: {
        fontSize: '1.375rem', // 22px
        lineHeight: '1.3',
        fontWeight: '600',
        fontFamily: 'Manrope',
        letterSpacing: '-0.015em',
      },
      headlineSm: {
        fontSize: '1.125rem', // 18px
        lineHeight: '1.35',
        fontWeight: '600',
        fontFamily: 'Manrope',
        letterSpacing: '-0.01em',
      },
      bodyLg: {
        fontSize: '1.0625rem', // 17px
        lineHeight: '1.6',
        fontWeight: '400',
        fontFamily: 'Inter',
      },
      bodyMd: {
        fontSize: '0.9375rem', // 15px
        lineHeight: '1.5',
        fontWeight: '400',
        fontFamily: 'Inter',
      },
      bodySm: {
        fontSize: '0.8125rem', // 13px
        lineHeight: '1.45',
        fontWeight: '400',
        fontFamily: 'Inter',
      },
      labelLg: {
        fontSize: '0.875rem', // 14px
        lineHeight: '1.25',
        fontWeight: '600',
        fontFamily: 'IBM Plex Mono',
        letterSpacing: '0.04em',
      },
      labelMd: {
        fontSize: '0.75rem', // 12px
        lineHeight: '1.3',
        fontWeight: '500',
        fontFamily: 'IBM Plex Mono',
        letterSpacing: '0.06em',
      },
      labelSm: {
        fontSize: '0.6875rem', // 11px
        lineHeight: '1.2',
        fontWeight: '500',
        fontFamily: 'IBM Plex Mono',
        letterSpacing: '0.08em',
      },
    },
  },

  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2.5rem', // 40px
    sidebarExpanded: '248px',
    sidebarCollapsed: '72px',
    headerHeight: '60px',
  },

  radius: {
    sm: '2px',
    default: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },

  shadows: {
    glowCyan: '0 0 20px rgba(54, 214, 196, 0.25)',
    glowCoral: '0 0 20px rgba(255, 98, 104, 0.25)',
    glowAmber: '0 0 20px rgba(255, 181, 71, 0.25)',
    panel: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    modal: '0 24px 48px -12px rgba(0, 0, 0, 0.75)',
  },

  motion: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  breakpoints: {
    mobileMax: '767px',
    tabletMin: '768px',
    tabletMax: '1199px',
    desktopMin: '1200px',
  },
} as const;

export default designTokens;
