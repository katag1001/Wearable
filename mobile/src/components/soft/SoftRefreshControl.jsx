// Pull to refresh in the soft look: the platform's spinner can't be the
// breathing bubble, so it's at least in the app's deep lavender on milk
// rather than the system's colours. Pass it as a list's refreshControl;
// every RefreshControl prop passes through.

import { RefreshControl } from "react-native";

import { accent, surface } from "../../theme/soft";

export const SoftRefreshControl = (props) => (
  <RefreshControl
    colors={[accent.deep]}
    tintColor={accent.deep}
    progressBackgroundColor={surface.milk}
    {...props}
  />
);
