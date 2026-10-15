import { pairingAnswerOptions } from "@core/constants/pairingQuestions.js";

// Style quiz step: one Yes / Sometimes / No pairing question at a time.
// Moving between questions is handled by useStyleQuiz
// (answerPairing / backFromPairing).
const PairingQuestionStep = ({ question: pairingQuestion, answer, onAnswer, onBack }) => {
  const { section, question, images } = pairingQuestion;

  return (
    <div className="style-quiz-step">
      <div className="style-quiz-header">
        <h2 className="page-title">{section}</h2>
        <p className="page-subtitle">{question}</p>
      </div>

      <div className="style-quiz-pairing-images">
        {images.map((image, index) =>
          image ? (
            <img
              key={index}
              src={image}
              alt=""
              className="style-quiz-pairing-image"
            />
          ) : (
            <div
              key={index}
              className="style-quiz-pairing-image style-quiz-pairing-image--placeholder"
            >
              Image coming soon
            </div>
          )
        )}
      </div>

      <div className="style-quiz-choice-options">
        {pairingAnswerOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`style-quiz-choice-card ${
              answer === option.value ? "style-quiz-choice-card--selected" : ""
            }`}
            onClick={() => onAnswer(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="style-quiz-actions style-quiz-actions--spaced">
        <button
          type="button"
          className="style-quiz-back-button"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default PairingQuestionStep;
