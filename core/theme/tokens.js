// core/theme/tokens.js
//
// The design values from the web app's :root (src/App.css), as numbers and
// strings the mobile app can use in StyleSheets. The web keeps using its CSS
// variables - if a colour changes, change it in both places.

export const colors = {
  main: "#111",
  secondary: "#6f6a63",
  tag: "#171717",
  muted: "#99938b",
  inverse: "#fff",

  pageBackground: "#fff",
  cardBackground: "#fff",
  border: "#ddd8d0",
  hoverBorder: "#aaa39a",
  imageBackground: "#f1efeb",

  errorBackground: "#faf0ee",
  errorBorder: "#e5c9c4",
  error: "#8b3a3a",

  successBackground: "#f2f5f0",
  successBorder: "#d2dccd",
  success: "#53634d",

  overlayBackdrop: "rgba(0, 0, 0, 0.42)",
};

// Phone-sized versions of the web font sizes (the web's are in rem and
// sized for desktop).
export const fontSizes = {
  title: 28,
  sectionTitle: 20,
  body: 15,
  small: 13,
  tag: 12,
};

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
};

export const letterSpacing = {
  tight: 0.4,
  normal: 0.6,
  wide: 1.4,
};
