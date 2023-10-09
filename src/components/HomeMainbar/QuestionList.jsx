import React from "react";
import Questions from "./Questions";
const QuestionList = ({ questionsList }) => {
  return (
    <>
      {questionsList.map((question) => (
        <Questions question={question} key={question.question_id} />
      ))}
    </>
  );
};

export default QuestionList;
