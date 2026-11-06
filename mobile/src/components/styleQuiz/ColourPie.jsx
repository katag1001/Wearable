// A colour family's colours as an equal-sliced pie chart (ColourFamilyPicker).

import Svg, { Circle, Path } from "react-native-svg";

import { colourHex } from "@core/utils/colourPalettes.js";

import { surface } from "../../theme/soft";

// A point on the circle, `fraction` of the way round from the top.
const pointAt = (centre, r, fraction) => {
  const angle = fraction * 2 * Math.PI - Math.PI / 2;

  return [centre + r * Math.cos(angle), centre + r * Math.sin(angle)];
};

const slicePath = (centre, r, from, to) => {
  const [x1, y1] = pointAt(centre, r, from);
  const [x2, y2] = pointAt(centre, r, to);
  const largeArc = to - from > 0.5 ? 1 : 0;

  return `M ${centre} ${centre} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};

export const ColourPie = ({ colours, size = 72 }) => {
  const centre = size / 2;
  const r = size / 2 - 1;
  const share = 1 / colours.length;

  if (colours.length === 1) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={centre} cy={centre} r={r} fill={colourHex(colours[0])} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size}>
      {colours.map((colour, index) => (
        <Path
          key={colour}
          d={slicePath(centre, r, index * share, (index + 1) * share)}
          fill={colourHex(colour)}
          stroke={surface.pearl}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
};
