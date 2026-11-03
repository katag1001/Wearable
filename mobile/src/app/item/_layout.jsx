// The add / edit item form, opened over the wardrobe as a modal.

import { Stack } from "expo-router";

import { softHeader } from "../../components/soft";

export default function ItemLayout() {
  return (
    <Stack screenOptions={softHeader} />
  );
}
