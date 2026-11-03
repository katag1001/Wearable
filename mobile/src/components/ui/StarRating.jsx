// An outfit's 1-5 star rating: iridescent filled stars up to `rating`,
// soft outlines after (all outlines when null). Tapping a star picks that
// rating. Drawn by soft/IridescentStars.

import { IridescentStars } from "../soft/IridescentStars";

export const StarRating = ({ rating, onChange, size = 24, style }) => (
  <IridescentStars rating={rating} onChange={onChange} size={size} style={style} />
);
