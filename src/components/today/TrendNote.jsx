import { trendNoteText } from "@core/today/trendNote.js";

// "White jeans are really in right now." - under a Today outfit that's on
// a current trend, for users who care a lot about trends. `shoeNote`: the
// same for the shoe shown (useTodayLook shoeTrendNote).
const TrendNote = ({ outfit, shoeNote }) => {
  const text = trendNoteText(outfit?.trendNote);

  return (
    <>
      {text && <p className="today-tights-note">{text}</p>}
      {shoeNote && <p className="today-tights-note">{shoeNote}</p>}
    </>
  );
};

export default TrendNote;
