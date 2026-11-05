// "Uses **0.24 Wh** of power" -> [{ text: "Uses ", bold: false },
// { text: "0.24 Wh", bold: true }, { text: " of power", bold: false }] -
// for copy that marks its bold parts with **, drawn by each app.
export const splitBold = (text) =>
  text
    .split("**")
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter(({ text: part }) => part);
