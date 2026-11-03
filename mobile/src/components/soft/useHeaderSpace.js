// The height of the stack header above this screen (0 with none), as space
// to leave at the top: the soft header is transparent and drawn over the
// page (headerOptions.js), so the page's content starts below it while its
// background runs up behind it.

import { use } from "react";
import { HeaderHeightContext } from "expo-router/react-navigation";

export const useHeaderSpace = () => use(HeaderHeightContext) ?? 0;
