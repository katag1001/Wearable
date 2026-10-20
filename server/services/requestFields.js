// server/services/requestFields.js
//
// Keeps only the allowed fields of a request body (lists in
// constants/editableFields.js). Pure - no DB access.

// The body's own values for `allowed` (fields it doesn't send are left
// out, so an update only changes what was sent).
const pickFields = (body, allowed) => {
  const source = body && typeof body === "object" ? body : {};

  return allowed.reduce((fields, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      fields[field] = source[field];
    }

    return fields;
  }, {});
};

module.exports = { pickFields };
