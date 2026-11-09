// One soap bubble: an almost clear body, a soft iridescent rim (a few light
// strokes on top of each other, so it reads blurred rather than drawn) and
// one or two highlights where light catches it. `variant` turns the rim's
// colours, so bubbles side by side don't catch the light the same way.

import { useId } from "react";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { iridescent, surface } from "../../theme/soft";

// Gradient direction per variant (x1, y1, x2, y2 in 0-1).
const DIRECTIONS = [
  [0, 0, 1, 1],
  [1, 0, 0, 1],
  [0.5, 0, 0.5, 1],
];

// Strokes from wide-and-faint to fine-and-clearer: a blurred rim.
const RIM = [
  { width: 7, opacity: 0.1 },
  { width: 3.5, opacity: 0.22 },
  { width: 1.2, opacity: 0.5 },
];

export const Bubble = ({ size, variant = 0, opacity = 1, style }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [x1, y1, x2, y2] = DIRECTIONS[variant % DIRECTIONS.length];

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={[{ opacity }, style]}>
      <Defs>
        <LinearGradient id={`rim${id}`} x1={x1} y1={y1} x2={x2} y2={y2}>
          {iridescent.map((colour, index) => (
            <Stop
              key={colour}
              offset={index / (iridescent.length - 1)}
              stopColor={colour}
            />
          ))}
        </LinearGradient>

        <RadialGradient id={`body${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0.55" stopColor={surface.white} stopOpacity="0" />
          <Stop offset="0.85" stopColor={surface.white} stopOpacity="0.08" />
          <Stop offset="1" stopColor={surface.white} stopOpacity="0.28" />
        </RadialGradient>

        <RadialGradient id={`shine${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={surface.white} stopOpacity="0.75" />
          <Stop offset="1" stopColor={surface.white} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Circle cx="50" cy="50" r="46" fill={`url(#body${id})`} />

      {RIM.map((stroke) => (
        <Circle
          key={stroke.width}
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={`url(#rim${id})`}
          strokeWidth={stroke.width}
          strokeOpacity={stroke.opacity}
        />
      ))}

      <Ellipse
        cx="31"
        cy="26"
        rx="11"
        ry="6.5"
        fill={`url(#shine${id})`}
        transform="rotate(-32 31 26)"
      />
      <Circle cx="71" cy="75" r="4" fill={`url(#shine${id})`} opacity={0.45} />
    </Svg>
  );
};
