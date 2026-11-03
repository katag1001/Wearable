// An inline notice above a form: "error" (rose-clay on blush) or "success"
// (sage on mint), on a soft tint with no border. Renders nothing without
// text.

import { SoftNote } from "../soft/SoftNote";

export const Message = ({ text, type = "error" }) => <SoftNote text={text} type={type} />;
