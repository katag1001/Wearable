import {
  pairingQuestions,
  pairingAnswerOptions,
} from "../../constants/pairingQuestions";

// Style quiz step: one Yes / Sometimes / No pairing question at a time.
// Answering moves on to the next question; after the last one, onNext.
// Back goes to the previous question, or out of the step from the first.
const PairingQuestionStep = ({
  answers,
  questionIndex,
  onQuestionChange,
  onAnswer,
  onBack,
  onNext,
}) => {
  const { key, section, question, images } = pairingQuestions[questionIndex];

  const handleAnswer = (value) => {
    onAnswer(key, value);

    if (questionIndex < pairingQuestions.length - 1) {
      onQuestionChange(questionIndex + 1);
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      onQuestionChange(questionIndex - 1);
    } else {
      onBack();
    }
  };

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
              answers[key] === option.value ? "style-quiz-choice-card--selected" : ""
            }`}
            onClick={() => handleAnswer(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="style-quiz-actions style-quiz-actions--spaced">
        <button
          type="button"
          className="style-quiz-back-button"
          onClick={handleBack}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default PairingQuestionStep;
